// Run with the gateway trio exported first (no DB is needed):
//   GATEWAY_ASSERTION_CERTIFICATE="$(cat tests/resources/gateway.crt)" \
//   GATEWAY_ASSERTION_ISSUER=test-gateway GATEWAY_ASSERTION_HEADER=x-jwt-assertion bal test
// The PEM files in tests/resources are throwaway test keys, used nowhere else.

import ballerina/crypto;
import ballerina/http;
import ballerina/jwt;
import ballerina/test;

const string TEST_ISSUER = "test-gateway";
const string TEST_HEADER = "x-jwt-assertion";

service http:InterceptableService /probe on new http:Listener(9191) {
    public function createInterceptors() returns AssertionInterceptor => new;

    resource function get whoami(http:RequestContext ctx) returns string|http:Unauthorized {
        GatewayCaller|http:Unauthorized caller = requireGatewayCaller(ctx);
        if caller !is GatewayCaller {
            return caller;
        }
        return caller.userId + "|" + caller.username;
    }

    resource function get open() returns string {
        return "open";
    }
}

function mint(string keyFile) returns string|error {
    crypto:PrivateKey key = check crypto:decodeRsaPrivateKeyFromKeyFile(keyFile);
    return jwt:issue({
        issuer: TEST_ISSUER,
        username: "user-1",
        expTime: 300,
        customClaims: {"username": "alice", "scope": "notes:read notes:write"},
        signatureConfig: {algorithm: jwt:RS256, config: key}
    });
}

function probe(string path, string? token) returns http:Response|error {
    http:Client cl = check new ("http://localhost:9191/probe");
    map<string|string[]> headers = {};
    if token is string {
        headers[TEST_HEADER] = token;
    }
    return cl->get(path, headers);
}

@test:Config {}
function validAssertionAccepted() returns error? {
    string token = check mint("tests/resources/signer.pem");
    http:Response res = check probe("/whoami", token);
    test:assertEquals(res.statusCode, 200);
    test:assertEquals(check res.getTextPayload(), "user-1|alice");
}

@test:Config {}
function wrongKeyRejected() returns error? {
    string token = check mint("tests/resources/other_signer.pem");
    http:Response res = check probe("/whoami", token);
    test:assertEquals(res.statusCode, 401);
}

@test:Config {}
function tamperedPayloadRejected() returns error? {
    string token = check mint("tests/resources/signer.pem");
    string[] parts = re `\.`.split(token);
    json forged = {"iss": TEST_ISSUER, "sub": "admin", "username": "mallory", "exp": 4102444800};
    string payload = forged.toJsonString().toBytes().toBase64();
    string tampered = parts[0] + "." + urlSafe(payload) + "." + parts[2];
    http:Response res = check probe("/whoami", tampered);
    test:assertEquals(res.statusCode, 401);
}

@test:Config {}
function missingAssertionIsUnauthorizedOnProtectedResource() returns error? {
    http:Response res = check probe("/whoami", ());
    test:assertEquals(res.statusCode, 401);
}

@test:Config {}
function publicResourceNeedsNoAssertion() returns error? {
    http:Response res = check probe("/open", ());
    test:assertEquals(res.statusCode, 200);
}

function urlSafe(string b64) returns string {
    string s = re `\+`.replaceAll(b64, "-");
    s = re `/`.replaceAll(s, "_");
    return re `=+$`.replaceAll(s, "");
}

@test:Config {}
function bodyIsTrimmed() returns error? {
    test:assertEquals(check validateNoteBody("  hello  "), "hello");
}

@test:Config {}
function emptyAndSpacesOnlyRejected() {
    test:assertTrue(validateNoteBody("") is error);
    test:assertTrue(validateNoteBody("   \n\t ") is error);
}

@test:Config {}
function lengthCountedInCharactersNotBytes() returns error? {
    // 280 four-byte emoji are 280 characters, over 1000 bytes
    string emoji = "";
    foreach int i in 0 ..< 280 {
        emoji += "😀";
    }
    test:assertEquals(check validateNoteBody(emoji), emoji);
    test:assertTrue(validateNoteBody(emoji + "a") is error);
}

@test:Config {}
function boundaryAt280AfterTrim() returns error? {
    string text = "".padEnd(280, "a");
    test:assertEquals(check validateNoteBody("  " + text + "  "), text);
    test:assertTrue(validateNoteBody(text + "b") is error);
}

@test:Config {}
function pageClamping() {
    Page p = clampPage(0, -5);
    test:assertEquals(p.pageLimit, 20);
    test:assertEquals(p.pageOffset, 0);
    test:assertEquals(clampPage(1000, 3).pageLimit, 100);
    test:assertEquals(clampPage(5, 3).pageLimit, 5);
}

@test:Config {}
function pageLinks() {
    test:assertEquals(nextOffset({pageLimit: 20, pageOffset: 0}, 45), 20);
    test:assertEquals(nextOffset({pageLimit: 20, pageOffset: 40}, 45), ());
    test:assertEquals(previousOffset({pageLimit: 20, pageOffset: 0}), ());
    test:assertEquals(previousOffset({pageLimit: 20, pageOffset: 10}), 0);
    test:assertEquals(previousOffset({pageLimit: 20, pageOffset: 40}), 20);
}

@test:Config {}
function authorNameFallsBackToUserId() {
    test:assertEquals(authorDisplayName("alice", "u1"), "alice");
    test:assertEquals(authorDisplayName("  ", "u1"), "u1");
}

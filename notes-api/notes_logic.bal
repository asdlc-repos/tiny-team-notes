const int MAX_NOTE_CHARS = 280;
const int DEFAULT_PAGE_LIMIT = 20;
const int MAX_PAGE_LIMIT = 100;

type Page record {|
    int pageLimit;
    int pageOffset;
|};

# Trims the body and checks 1 to 280 characters (code points, not bytes).
#
# + raw - the body as posted
# + return - the trimmed body to store, or an error describing the problem
function validateNoteBody(string raw) returns string|error {
    string text = raw.trim();
    if text == "" {
        return error("A note must not be empty or only spaces");
    }
    if text.length() > MAX_NOTE_CHARS {
        return error("A note must be at most 280 characters");
    }
    return text;
}

function clampPage(int 'limit, int offset) returns Page {
    int pageLimit = 'limit < 1 ? DEFAULT_PAGE_LIMIT : ('limit > MAX_PAGE_LIMIT ? MAX_PAGE_LIMIT : 'limit);
    int pageOffset = offset < 0 ? 0 : offset;
    return {pageLimit, pageOffset};
}

function nextOffset(Page page, int total) returns int? {
    int following = page.pageOffset + page.pageLimit;
    return following < total ? following : ();
}

function previousOffset(Page page) returns int? {
    return page.pageOffset > 0 ? int:max(0, page.pageOffset - page.pageLimit) : ();
}

function authorDisplayName(string username, string userId) returns string
    => username.trim() == "" ? userId : username.trim();

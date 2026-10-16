import type { ReactElement } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AppShell, ColorSchemeToggle, Divider, Footer, Header, Sidebar, UserMenu } from "@wso2/oxygen-ui";
import { LayoutDashboard, User } from "@wso2/oxygen-ui-icons-react";
import { Can } from "../authz/gates";
import { signOut } from "../authz/session";
import { SCREEN_ROUTES } from "../authz/screens";
import { APP_NAME } from "../appName";
import { useWho } from "../pages/Account";
import { useNavigate } from "react-router-dom";

export default function AppLayout(): ReactElement {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const who = useWho();
  const board = SCREEN_ROUTES.find((s) => s.key === "board")!;
  const active = pathname.startsWith("/account") ? "account" : "board";

  return (
    <AppShell>
      <AppShell.Navbar>
        <Header>
          <Header.Toggle />
          <Header.Brand>
            <Header.BrandTitle>{APP_NAME}</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ColorSchemeToggle />
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <UserMenu>
              <UserMenu.Trigger name={who.name || "Account"} />
              <UserMenu.Header name={who.name} email={who.email} />
              <UserMenu.Item icon={<User />} label="Account" onClick={() => navigate("/account")} />
              <UserMenu.Divider />
              <UserMenu.Logout label="Sign out" onClick={() => void signOut()} />
            </UserMenu>
          </Header.Actions>
        </Header>
      </AppShell.Navbar>

      <AppShell.Sidebar>
        <Sidebar activeItem={active}>
          <Sidebar.Nav>
            <Sidebar.Category>
              {board.loads !== null && (
                <Can op={board.loads}>
                  <Sidebar.Item id="board" link={<Link to={board.path} />}>
                    <Sidebar.ItemIcon>
                      <LayoutDashboard />
                    </Sidebar.ItemIcon>
                    <Sidebar.ItemLabel>{board.label}</Sidebar.ItemLabel>
                  </Sidebar.Item>
                </Can>
              )}
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </AppShell.Sidebar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <Footer>
          <Footer.Copyright>© WSO2 LLC</Footer.Copyright>
        </Footer>
      </AppShell.Footer>
    </AppShell>
  );
}

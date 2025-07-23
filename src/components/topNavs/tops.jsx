import Account from "../auth/account";
import TopNav from "./topNav";

export default function TopSection() {
    return (
        <div style={{ display: "flex", gap: "25px"  }}>
            <TopNav />
            <Account />
        </div>
    );
}

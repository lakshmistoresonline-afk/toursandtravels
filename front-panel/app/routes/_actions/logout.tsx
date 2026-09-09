import { redirect } from "react-router";
import { AuthService } from "@workspace/shared/services/auth.service";

export async function clientAction() {
	const authSvc = new AuthService();
	await authSvc.logout();
	return redirect("/login?success=Logged out successfully");
}

export default function LogoutRoute() {
	return null;
}

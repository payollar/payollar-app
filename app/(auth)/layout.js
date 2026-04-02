import { AuthChrome } from "@/components/auth/auth-chrome";

const AuthLayout = ({ children }) => {
  return (
    <div data-auth-page="true" className="auth-page">
      <AuthChrome>{children}</AuthChrome>
    </div>
  );
};

export default AuthLayout;

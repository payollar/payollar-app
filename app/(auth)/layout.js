const AuthLayout = ({ children }) => {
  return (
    <div data-auth-page="true" className="auth-page">
      {children}
    </div>
  );
};

export default AuthLayout;

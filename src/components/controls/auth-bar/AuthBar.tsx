import { Button } from "../../ui/button";
// import { useTranslations } from "next-intl";

const AuthBar = () => {
//   const tAB = useTranslations("AuthBar");
  const onClickLogin = () => {
    alert("ფუნქცია ჯერ არ მუშაობს");
  };
  const onClickSignUp = () => {
    alert("ფუნქცია ჯერ არ მუშაობს");
  };
  return (
    <div className="flex items-center gap-2 ml-2">
      <Button variant="ghost" size="sm" onClick={onClickLogin}>
        {/* {tAB("signin")} */}
        signin
      </Button>
      <Button
        onClick={onClickSignUp}
        size="sm"
        className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
      >
        {/* {tAB("signup")} */}
        signup
      </Button>
    </div>
  );
};

export default AuthBar;
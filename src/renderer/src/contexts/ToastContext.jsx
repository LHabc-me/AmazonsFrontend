import { createContext } from "react";
import { Toast, ToastBody, Toaster, ToastTitle, useId, useToastController } from "@fluentui/react-components";

const ToastContext = createContext(null);
/*
toast.message(string): 提示消息
toast.warning(string): 警告消息
toast.error(string): 错误消息
toast.success(string): 成功消息
 */
const toast = {};
ToastContext.toast = toast;
const ToastProvider = (props) => {
  const { children } = props;
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const notify = (type, title, message) => {
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
        <ToastBody>{message}</ToastBody>
      </Toast>,
      { intent: type }
    );
  };
  toast.message = (title, message) => notify("info", title, message);
  toast.warning = (title, message) => notify("warning", title, message);
  toast.error = (title, message) => notify("error", title, message);
  toast.success = (title, message) => notify("success", title, message);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Toaster toasterId={toasterId}
               position={"bottom-end"}
               pauseOnHover
               pauseOnWindowBlur
               timeout={1500} />
    </ToastContext.Provider>
  );
};
export { ToastProvider };
export default ToastContext;

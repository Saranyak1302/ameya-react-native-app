import {
  //@ts-ignore
  React,
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import AlertModal from '../components/AlertModal';
import {AlertButtons} from '../types/CommonTypes';

// Define the shape of the context
export interface AppContextProps {
  isTryingLogin: boolean;
  setIsTryingLogin: Dispatch<SetStateAction<boolean>>;
  showAlert: boolean;
  setShowAlert: Dispatch<SetStateAction<boolean>>;
  alertTitle: string;
  setAlertTitle: Dispatch<SetStateAction<string>>;
  alertMessage: ReactNode | string;
  setAlertMessage: Dispatch<SetStateAction<ReactNode | string>>;
  alertButtons?: AlertButtons;
  setAlertButtons?: Dispatch<SetStateAction<AlertButtons | undefined>>;
  clearAlert: () => void;
}

// Create a context with the initial value as `undefined`
const AppContext = createContext<AppContextProps | undefined>(undefined);

// Define the props for AppProvider
interface AppProviderProps {
  children: ReactNode;
}

// Create the provider component
const AppProvider = ({children}: AppProviderProps) => {
  const [isTryingLogin, setIsTryingLogin] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState<ReactNode | string>('');
  const [alertButtons, setAlertButtons] = useState<AlertButtons>();

  const clearAlert = () => {
    setShowAlert(false);
    setAlertTitle('');
    setAlertMessage('');
    setAlertButtons(undefined);
  };

  return (
    <AppContext.Provider
      value={{
        isTryingLogin,
        setIsTryingLogin,
        showAlert,
        setShowAlert,
        alertTitle,
        setAlertTitle,
        alertMessage,
        setAlertMessage,
        alertButtons,
        setAlertButtons,
        clearAlert,
      }}>
      <>
        {children}
        {showAlert && (
          <AlertModal
            alertModalVisible={showAlert}
            title={alertTitle}
            message={alertMessage}
            buttons={
              alertButtons && alertButtons.length > 0 ? alertButtons : undefined
            }
            column
            onClose={() => {
              clearAlert();
            }}
          />
        )}
      </>
    </AppContext.Provider>
  );
};

export {AppContext, AppProvider};

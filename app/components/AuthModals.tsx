'use client';

import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import ActivationManagement from './auth/ActivationManagement';

interface AuthModalsProps {
  showLoginForm: boolean;
  showRegisterForm: boolean;
  showActivationManagement: boolean;
  onCloseLogin: () => void;
  onCloseRegister: () => void;
  onCloseActivationManagement: () => void;
  onLoginSuccess: () => void;
  onRegisterSuccess: () => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
}

const AuthModals: React.FC<AuthModalsProps> = ({
  showLoginForm,
  showRegisterForm,
  showActivationManagement,
  onCloseLogin,
  onCloseRegister,
  onCloseActivationManagement,
  onLoginSuccess,
  onRegisterSuccess,
  onSwitchToRegister,
  onSwitchToLogin
}) => {
  return (
    <>
      {/* 登录表单模态框 */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">用户登录</h2>
              <button
                onClick={onCloseLogin}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <LoginForm
              onSuccess={onLoginSuccess}
              onSwitchToRegister={onSwitchToRegister}
            />
          </div>
        </div>
      )}

      {/* 注册表单模态框 */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">用户注册</h2>
              <button
                onClick={onCloseRegister}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <RegisterForm
              onSuccess={onRegisterSuccess}
              onSwitchToLogin={onSwitchToLogin}
            />
          </div>
        </div>
      )}

      {/* 激活码管理模态框 */}
      {showActivationManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">激活码管理</h2>
              <button
                onClick={onCloseActivationManagement}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ActivationManagement />
          </div>
        </div>
      )}
    </>
  );
};

export default AuthModals; 
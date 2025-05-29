'use client';

interface UserStatusBarProps {
  isLoggedIn: boolean;
  currentUser: any;
  onShowLogin: () => void;
  onShowRegister: () => void;
  onShowActivationManagement: () => void;
  onLogout: () => void;
}

const UserStatusBar: React.FC<UserStatusBarProps> = ({
  isLoggedIn,
  currentUser,
  onShowLogin,
  onShowRegister,
  onShowActivationManagement,
  onLogout
}) => {
  if (isLoggedIn) {
    // 已登录状态栏
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 mx-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">
              欢迎，{currentUser?.nickname || currentUser?.name || '用户'}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              已登录
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onShowActivationManagement}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              激活码管理
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    // 未登录提示栏
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 mx-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-800">请登录后使用完整功能</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onShowLogin}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              登录
            </button>
            <button
              onClick={onShowRegister}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              注册
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default UserStatusBar; 
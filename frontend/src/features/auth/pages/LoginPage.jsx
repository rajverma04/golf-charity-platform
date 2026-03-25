import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Welcome to <span className="text-blue-400">Charity</span><span className="text-purple-500">Lottery</span>
        </h1>
        <p className="text-neutral-400 max-w-lg mx-auto">
          Play to win, play to give. Join the most transparent and impactful lottery platform on the internet.
        </p>
      </div>
      
      <LoginForm />
      
      <div className="mt-12 flex items-center justify-center space-x-6 text-sm text-neutral-500">
        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
      </div>
    </div>
  );
};

export default LoginPage;

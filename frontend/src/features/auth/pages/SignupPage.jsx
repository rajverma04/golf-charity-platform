import SignupForm from '../components/SignupForm';

const SignupPage = () => {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Start Making an <span className="text-pink-500">Impact</span>
        </h1>
        <p className="text-neutral-400 max-w-lg mx-auto">
          Create an account today to participate in monthly draws and donate a percentage of your winnings to your favorite NGOs.
        </p>
      </div>
      
      <SignupForm />
      
      <div className="mt-12 flex items-center justify-center space-x-6 text-sm text-neutral-500">
        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
      </div>
    </div>
  );
};

export default SignupPage;

import { ZapIcon } from "lucide-react";
const RateLimitedUI = () => {
  return (
    <div className="text-black max-w-6xl mx-auto px-4 py-8">
      <div className="bg-primary/20 border border-primary/30 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row items-center p-6">
          <div className="shrink-0 bg-primary/20 p-4 rounded-full mb-4 md:mb-0 md:mr-6">
            <ZapIcon className="size-10 text-primary" />
          </div>
          <div className="text-black flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">Rate Limit Reached</h3>
            <p className="mb-1">
              You've made a too many requests in a short period. Please wait a
              moment.
            </p>
            <p className="text-sm">
              Try again in a few seconds for the best experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitedUI;

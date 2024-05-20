"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AiFillCheckCircle } from 'react-icons/ai';

const OrderSuccess = () => {
  const router = useRouter();

  const handleSubmit = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center flex flex-col items-center"
      >
        <AiFillCheckCircle size={100} className="text-green-500 mb-8" />
        <h1 className="text-2xl font-semibold mb-8">
          We have received your order and will prepare it shortly.
        </h1>
        <button
          onClick={handleSubmit}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
          type="button"
        >
          Continue Shopping
        </button>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;

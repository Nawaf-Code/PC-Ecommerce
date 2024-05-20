import Head from 'next/head';
import OrderSuccess from '@/components/Checkout/CheckoutComplete/OrderSuccess';
import CheckoutSucceeded from '@/components/Checkout/CheckoutComplete/Succeeded';

export default function SuccessPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <Head>
        <title>Order Successful</title>
      </Head>
      
      <CheckoutSucceeded />
    </div>
  );
}

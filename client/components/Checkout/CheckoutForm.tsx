import axios from "axios";
import { AiOutlineLoading } from "react-icons/ai";
import { toast } from "react-toastify";
import { Order } from "@/lib/types";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import UserAddress from "../Home/Profile/UserAddress";
import { useShoppingCart } from "@/context/ShoppingCartContext";
import CheckoutSucceeded from "@/components/Checkout/CheckoutComplete/Succeeded";

export default function CheckoutForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Using the corrected useRouter
  const { cartItems } = useShoppingCart();
  const [status, setStatus] = useState(false);
  const [order, setOrder] = useState<Order>({} as Order);
  const { removeAll } = useShoppingCart();

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!user?.address) {
      toast.error("You need to set an address first.");
      return;
    }

    setIsLoading(true);

    const productsData = cartItems.map(item => ({
      productId: item.id,
      price: item.price,
      quantity: item.quantity
    }));

    const orderData = {
      paymentIntent: `pi_${new Date().getTime()}`,
      products: productsData,
      user: {
        email: user.email,
        address: {
          fullName: user.address.fullName,
          contactNumber: user.address.contactNumber,
          country: user.address.country,
          city: user.address.city,
          addressLine: user.address.addressLine,
          addressLineSecond: user.address.addressLineSecond || ""
        }
      }
    };

    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/orders/add", orderData, {
        headers: { "Content-type": "application/json" },
      });
  
      // Uncomment if you need to use the response data
      // setOrder(response.data);
      //removeAll();

    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(`Failed to create order: ${error.response?.data || error.message}`);

    } finally {
      setIsLoading(false);
      router.push('/thank/')
    }
  };

  return (
    <form
      id="payment-form"
      onSubmit={handleSubmit}
      className="max-h-[600px] p-1 scrollbar-cart overflow-y-auto"
    >
      <div className="flex flex-col gap-2">
        <UserAddress
          fullName={user?.address?.fullName || ""}
          contactNumber={user?.address?.contactNumber || ""}
          country={user?.address?.country || ""}
          city={user?.address?.city || ""}
          addressLine={user?.address?.addressLine || ""}
          addressLineSecond={user?.address?.addressLineSecond || ""}
        />
        <div className="p-4 rounded border border-gray-300 text-gray-600">
          Demo payment info (not charged)
        </div>
      </div>
      <button
        disabled={isLoading}
        id="submit"
        className="flex items-center justify-center bg-black text-white w-full rounded p-2 mt-2"
      >
        {isLoading ? <AiOutlineLoading className="animate-spin" /> : 'Pay now'}
      </button>
    </form>
  );
}

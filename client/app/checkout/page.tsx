"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import { useShoppingCart } from "@/context/ShoppingCartContext";

import CheckoutForm from "@/components/Checkout/CheckoutForm";
import CheckoutInfo from "@/components/Checkout/CheckoutInfo";

export default function OrderPage() {
  const router = useRouter();
  const { cartItems, getSubtotal } = useShoppingCart();

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/");
    }
  }, [cartItems, router]);

  return (
    <>
      <div className="flex flex-col sm:flex-row container h-[100vh] min-h-[600px] mx-auto">
        <div className="flex flex-1 justify-center items-center p-4">
          <CheckoutInfo products={cartItems} subtotal={getSubtotal} />
        </div>
        <div className="flex flex-1 justify-center items-center p-4">
          <CheckoutForm />
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={2000} pauseOnHover={false} />
    </>
  );
}

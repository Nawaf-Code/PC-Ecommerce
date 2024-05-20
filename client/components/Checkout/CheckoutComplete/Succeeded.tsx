"use client";

import {
  AiFillCheckCircle,
  AiFillHome,
  AiFillPhone,
  AiOutlineLoading,
  AiOutlineUser,
} from "react-icons/ai";
import { useShoppingCart } from "@/context/ShoppingCartContext";

import { useRouter } from 'next/navigation';
import Image from "next/image";

import { Order } from "@/lib/types";

export default function CheckoutSucceeded() {
  const router = useRouter();
  const { cartItems } = useShoppingCart();
  const { getSubtotal } = useShoppingCart();


  return (
    <div className="max-w-[400px]">
      <div className="flex flex-col w-full gap-4">
        <ul className="w-full max-h-[300px] scrollbar-cart overflow-auto">
          {cartItems?.map((product, index) => (
            <li key={index}>
              <div className="flex p-1">
                <div className="relative aspect-square w-16 h-16 rounded overflow-hidden">
                  <Image
                    src={product.src}
                    alt={product.brand}
                    fill
                    sizes="(max-width: 380px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-betweens text-sm text-gray-500 ml-3 gap-1">
                  <span className="font-semibold text-black">
                    {product.brand}
                  </span>
                  <span>{`$${product.price} x ${product.quantity}`}</span>
                  <span>
                    {product.brand +
                      (product.size ? " / " + product.size : "") +
                      (product.color ? " / " + product.color : "")}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-colt justify-between w-full text-2xl font-semibold mt-3">
        <h1>Subtotal</h1>
        <h1>{"$" + getSubtotal}</h1>
      </div>
      <div className="flex flex-col items-center text-center rounded-lg border p-4 text-green-500 font-semibold gap-1 mt-4">
        <AiFillCheckCircle size={36} />
        <div className="flex flex-col mt-4">
          <h2>We have received your order and will prepear it shortly.</h2>
        </div>
      </div>
      <div
        onClick={() => router.push("/")}
        className="flex justify-center border border-gray-300 rounded-lg font-semibold cursor-pointer px-4 py-2 mt-2 hover:bg-gray-50"
      >
        <span>Continue shopping</span>
      </div>
    </div>
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

import { useURLParams } from "./ParamsContext";

import { OrderProps, ProductRequest, StatisticsProps } from "@/lib/types";
import { toast } from "react-toastify";
import { useProducts } from "./ProductsContext";

type DashboardContextProvider = {
  children: React.ReactNode;
};

type IDashboardContext = {
  ordersResponse: OrderProps | null;
  statistics: StatisticsProps | null;
  createProduct: (data: ProductRequest, formData: FormData) => void;
  deleteProduct: (productId: number) => void;
};

export const DashboardContext = createContext({} as IDashboardContext);

export function useDashboard() {
  return useContext(DashboardContext);
}

export function DashboardProvider({ children }: DashboardContextProvider) {
  const { fetchProducts } = useProducts();
  const { orderId, sort, pn } = useURLParams();

  const [statistics, setStatistics] = useState<StatisticsProps | null>(null);
  const [ordersResponse, setOrdersResponse] = useState<OrderProps | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchOrders();

    // eslint-disable-next-line
  }, [orderId, sort, pn]);

  async function fetchOrders() {
    await axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/orders", {
        params: {
          orderId: orderId,
          sort: sort,
          pn: pn,
        },
      })
      .then((response) => {
        setOrdersResponse(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function fetchStatistics() {
    await axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/dashboard/statistics")
      .then((response) => {
        setStatistics(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function createProduct(data, formData) {
    try {
      const res = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/products/create", data);
      const product = res.data;
      formData.append("productId", product.id);
      formData.append("productName", product.name);
  
      await axios.post(process.env.NEXT_PUBLIC_API_URL + "/products/image/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      toast.success("Product created successfully!");
    } catch (error) {
      console.error("Error in createProduct:", error);
      if (error.response) {
        console.error("Detailed error:", error.response.data);
        toast.error("Error creating product: " + JSON.stringify(error.response.data));
      } else {
        toast.error("Error creating product: " + error.message);
      }
    }
  }
  

  async function createProductImage(data: FormData) {
    await axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/products/image/upload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        toast.success(res.data);
        fetchProducts();
      })
      .catch((err) => toast.error(err.data));
  }

  async function deleteProduct(productId: number) {
    await axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/products/delete", { productId })
      .then((res) => {
        toast.success(res.data);
        fetchProducts();
      })
      .catch((err) => toast.error("Something went wrong, try again."));
  }

  return (
    <DashboardContext.Provider
      value={{ ordersResponse, statistics, createProduct, deleteProduct }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

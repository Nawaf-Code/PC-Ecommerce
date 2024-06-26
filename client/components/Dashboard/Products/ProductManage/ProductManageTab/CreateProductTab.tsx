import { AiFillCloseSquare, AiOutlinePlus } from "react-icons/ai";
import { useState } from "react";

import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { toast } from "react-toastify";
import Image from "next/image";

import { ProductVariant } from "@/lib/types";
import { categories, subcategories } from "@/lib/constants";

import productCreateSchema from "@/validations/productCreateSchema";

import { useDashboard } from "@/context/DashboardContext";

export default function CreateProductTab() {
  const { createProduct } = useDashboard();

  const [images, setImages] = useState<File[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [variantName, setVariantName] = useState<string>("Size");
  const [variantValue, setVariantValue] = useState<string>("");
  const [variantQuantity, setVariantQuantity] = useState<number>(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;

    if (selectedFiles) {
      const selectedImages: File[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // File type control
        if (
          file.type !== "image/png" &&
          file.type !== "image/jpeg" &&
          file.type !== "image/webp"
        ) {
          toast.error(
            "Unsupported file format. Please upload only PNG, JPEG, or WebP images."
          );
        } else {
          // File size control - Max limit 3MB
          if (file.size > 3000000) {
            toast.error(
              "File size exceeds the maximum limit of 3MB. Please choose a smaller file."
            );
          } else {
            selectedImages.push(file);
          }
        }
      }

      setImages(selectedImages);
    }
  };

  const handleImageRemove = (index: number) => {
    const updatedImages = [
      ...images.slice(0, index),
      ...images.slice(index + 1),
    ];

    setImages(updatedImages);
  };

  const handleVariant = () => {
    if (
      !variantName ||
      !variantValue ||
      !variantQuantity ||
      variantQuantity <= 0
    ) {
      toast.error("Variant inputs can't be empty.");
      return;
    }

    if (variants.some((v) => v.value == variantValue)) {
      toast.error("This option already exist.");
      return;
    }

    setVariants([
      ...variants,
      {
        name: variantName as string,
        value: variantValue as string,
        quantity: Number(variantQuantity),
      },
    ]);
  };

  const handleSubmit = (values, formikHelpers) => {
    if (values.discountPrice && values.discountPrice >= values.price) {
      toast.error("Discount must be lower than current price.");
      return;
    }
  
    if (images.length === 0) {
      toast.error("You must upload at least one product image.");
      return;
    }
  
    const currentDate = new Date();
    const date = currentDate.toLocaleString("en-GB").replace(",", "");
  
    let totalQuantity = variants.reduce((acc, variant) => acc + Number(variant.quantity), 0);
  
    const data = {
      brand: values.brand,
      name: values.name,
      slug: values.slug,
      price: values.price,
      discountPrice: values.discountPrice || undefined,
      categoryId: values.categoryId,
      subcategoryId: values.subcategoryId,
      date: date,
      quantity: totalQuantity,
      variants: variants,
    };
  
    const formData = new FormData();
    images.forEach(image => formData.append("images", image));
  
    createProduct(data, formData);
  
    formikHelpers.resetForm();
    setVariants([]);
    setImages([]);
    setVariantValue("");
    setVariantQuantity(0);
  };

  return (
    <Formik
      initialValues={{
        brand: "",
        name: "",
        price: "",
        discountPrice: "",
        slug: "",
        categoryId: 1,
        subcategoryId: 1,
        variants: variants,
        images: images,
      }}
      onSubmit={handleSubmit}
      validationSchema={productCreateSchema}
    >
      {(formControl) => (
        <Form className="flex flex-col">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex flex-col flex-1">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor="brand" className="select-none">
                    Brand
                  </label>
                  <div className="flex border focus-within:border-gray-400">
                    <Field
                      id="brand"
                      name="brand"
                      placeholder="Nike"
                      type="text"
                      className="w-full p-2 focus:outline-none"
                    />
                  </div>
                  <ErrorMessage
                    component="span"
                    className="text-red-600"
                    id="brand"
                    name="brand"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="name" className="select-none">
                    Name
                  </label>
                  <div className="flex border focus-within:border-gray-400">
                    <Field
                      id="name"
                      name="name"
                      placeholder="Air Jordan"
                      type="text"
                      className="w-full p-2 focus:outline-none"
                    />
                  </div>
                  <ErrorMessage
                    component="span"
                    className="text-red-600"
                    id="name"
                    name="name"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 mt-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="price" className="select-none">
                    Price
                  </label>
                  <div className="flex border focus-within:border-gray-400">
                    <Field
                      id="price"
                      name="price"
                      placeholder="19.99"
                      type="text"
                      className="w-full p-2 focus:outline-none"
                    />
                  </div>
                  <ErrorMessage
                    component="span"
                    className="text-red-600"
                    id="price"
                    name="price"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="discountPrice" className="select-none">
                    Discount Price (optional)
                  </label>
                  <div className="flex border focus-within:border-gray-400">
                    <Field
                      id="discountPrice"
                      name="discountPrice"
                      placeholder="12.99"
                      type="text"
                      className="w-full p-2 focus:outline-none"
                    />
                  </div>
                  <ErrorMessage
                    component="span"
                    className="text-red-600"
                    id="discountPrice"
                    name="discountPrice"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 mt-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="slug" className="select-none">
                    Slug
                  </label>
                  <div className="flex border focus-within:border-gray-400">
                    <Field
                      id="slug"
                      name="slug"
                      placeholder="air-jordan"
                      type="text"
                      className="w-full p-2 focus:outline-none"
                    />
                  </div>
                  <ErrorMessage
                    component="span"
                    className="text-red-600"
                    id="slug"
                    name="slug"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="categoryId" className="select-none">
                    Category
                  </label>
                  <div className="flex border focus-within:border-gray-400">
                    <Field
                      id="categoryId"
                      name="categoryId"
                      as="select"
                      className="w-full outline-none m-2"
                    >
                      {categories.map((category, index) => (
                        <option key={index} value={index + 1}>
                          {category}
                        </option>
                      ))}
                    </Field>
                  </div>
                  <ErrorMessage
                    component="span"
                    className="text-red-600"
                    id="categoryId"
                    name="categoryId"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="subcategoryId" className="select-none">
                    Subcategory
                  </label>
                  <div className="flex border focus-within:border-gray-400">
                    <Field
                      id="subcategoryId"
                      name="subcategoryId"
                      as="select"
                      className="w-full outline-none m-2"
                    >
                      {subcategories.map((subcategory, index) => (
                        <option key={index} value={index + 1}>
                          {subcategory}
                        </option>
                      ))}
                    </Field>
                  </div>
                  <ErrorMessage
                    component="span"
                    className="text-red-600"
                    id="subcategoryId"
                    name="subcategoryId"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 mt-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="variants" className="select-none">
                    Add Variant (optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex border focus-within:border-gray-400">
                      <Field
                        id="variantName"
                        name="variantName"
                        as="select"
                        className="w-20 outline-none m-2"
                        value={variantName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setVariantName(e.target.value)
                        }
                      >
                        <option value="Size">Size</option>
                        <option value="Color">Color</option>
                      </Field>
                    </div>
                    <div className="flex border focus-within:border-gray-400">
                      <Field
                        id="variantValue"
                        name="variantValue"
                        value={variantValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setVariantValue(e.target.value)
                        }
                        placeholder="XL / 42 / Red"
                        type="text"
                        className="w-32 p-2 focus:outline-none"
                      />
                    </div>
                    <div className="flex border focus-within:border-gray-400">
                      <Field
                        id="variantQuantity"
                        name="variantQuantity"
                        value={variantQuantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setVariantQuantity(Number(e.target.value))
                        }
                        placeholder="Quantity"
                        type="number"
                        min={1}
                        className="w-24 p-2 focus:outline-none"
                      />
                    </div>
                    <div
                      onClick={handleVariant}
                      className="flex items-center justify-center w-10 h-10 bg-black text-white cursor-pointer"
                    >
                      <AiOutlinePlus size={22} />
                    </div>
                  </div>
                  <ErrorMessage
                    component="span"
                    className="text-red-600"
                    id="variants"
                    name="variants"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-1 gap-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="slug" className="select-none">
                  Upload An Image
                </label>
                <div className="relative flex items-center justify-center h-44 w-44 border border-black cursor-pointer">
                  <Field
                    type="file"
                    name="images"
                    id="images"
                    className="absolute w-full h-full opacity-0"
                    multiple
                    onChange={handleImageChange}
                    accept=".jpg, .jpeg, .png, .webp"
                  />
                  <AiOutlinePlus size={36} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {images.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">Images</span>
                    <div className="flex flex-wrap gap-2">
                      {images.map((image, index) => (
                        <div
                          key={index}
                          onClick={() => handleImageRemove(index)}
                          className="relative group w-12 h-12"
                        >
                          <Image
                            src={URL.createObjectURL(image)}
                            alt={image.name}
                            className="object-contain"
                            sizes="(min-width: 640px) 50vw, 100vw"
                            fill
                          />
                          <div className="relative hidden group-hover:flex items-center justify-center w-full h-full bg-black/70 text-white cursor-pointer">
                            <AiFillCloseSquare size={22} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {variants.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="font-semibold">Variants</span>
                    <div className="flex flex-wrap gap-2">
                      {variants?.map((variant, index) => (
                        <div
                          key={index}
                          className="bg-gray-100 select-none p-2"
                        >
                          {variant.name + ": " + variant.value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="ml-auto mt-3">
            <button
              type="submit"
              disabled={
                !(
                  formControl.isValid &&
                  formControl.dirty &&
                  !formControl.isSubmitting
                )
              }
              className="w-32 text-gray-600 font-semibold border-2 border-gray-300 transition-all ease-linear select-none p-2 enabled:hover:border-black enabled:hover:bg-black enabled:hover:text-white disabled:bg-gray-300 disabled:text-gray-800"
            >
              Create
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

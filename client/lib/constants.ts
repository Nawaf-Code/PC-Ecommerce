import { Carousel, Campaigns } from "@/lib/types";

export const categories: String[] = [
  "Custom PC",
  "Mens",
  "CHAIRS & TABLE",
  "PARTS",
  "ACCESSORIES",
  "MONITORS",
  "LAPTOPS",
];

export const subcategories = [
  "Shoes",
  "HDD",
  "NONE",
  "SSD",
  "GPU",
  "RAMS",
  "CPUs",
  "MOTHERBOARDS",
  "POWER SUPPLY",
  "FANS",
  "CASES",
  'CABLES',
  'MICS',
  'HEADPHONES',
  'MOUSE PAD',
  'MOUSE',
];

export const colors = [
  { hex: "#FFF", label: "White" },
  { hex: "#000", label: "Black" },
  { hex: "#FF0000", label: "Red" },
  { hex: "#FFFF00", label: "Yellow" },
  { hex: "#0000FF", label: "Blue" },
  { hex: "#008000", label: "Green" },
  { hex: "#FFC0CB", label: "Pink" },
];

export const sorts = [
  { name: "dateDesc", value: "Date: newest first" },
  { name: "dateAsc", value: "Date: oldest first" },
  { name: "priceAsc", value: "Price: lowest first" },
  { name: "priceDesc", value: "Price: highest first" },
];

export const brands = ["Nike", "Adidas", "Lacoste", "The North Face"];

export const campaigns: Campaigns[] = [
  {
    brand: "Custom PC",
    desc: "Save 15% on RTX 4060",
    src: "/assets/campaigns/1.png",
  },
  {
    brand: "Custom PC",
    desc: "Custom PC -10% off, Higher Comfort With Supernova+.",
    src: "/assets/campaigns/4.webp",
  },
  {
    brand: "Gaming Chair",
    desc: "Save 25% on Infiniarc GT.",
    src: "/assets/campaigns/2.png",
  },
  {
    brand: "Monitors",
    desc: "Save up to 40% off on DEVO Monitor.",
    src: "/assets/campaigns/4.png",
  },
];

export const carouselItems: Carousel[] = [
  {
    href: "./",
    src: "/assets/carousel/1.jpeg",
    alt: "1",
  },
  {
    href: "./",
    src: "/assets/carousel/2.jpeg",
    alt: "2",
  },
  {
    href: "./",
    src: "/assets/carousel/3.jpeg",
    alt: "3",
  },
  {
    href: "./",
    src: "/assets/carousel/4.jpeg",
    alt: "4",
  },
];

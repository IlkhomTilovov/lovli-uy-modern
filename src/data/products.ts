import categoryCleaning from "@/assets/category-cleaning.jpg";
import categoryLaundry from "@/assets/category-laundry.jpg";
import categoryHygiene from "@/assets/category-hygiene.jpg";
import categoryHouse from "@/assets/category-house.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  categorySlug: string;
  description: string;
  volume: string;
  inStock: boolean;
  featured: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Universal Tozalash Spreyi",
    price: 25000,
    image: "/placeholder.svg",
    category: "Tozalash vositalari",
    categorySlug: "cleaning",
    description: "Barcha yuzalar uchun universal tozalash vositasi. Mikroorganizmlarni yo'q qiladi va yangi hid qoldiradi.",
    volume: "500ml",
    inStock: true,
    featured: true,
  },
  {
    id: "2",
    name: "Kir Yuvish Kukuni Premium",
    price: 45000,
    image: "/placeholder.svg",
    category: "Kir yuvish vositalari",
    categorySlug: "laundry",
    description: "Yuqori sifatli kir yuvish kukuni. Har qanday turdagi matolar uchun mos.",
    volume: "3kg",
    inStock: true,
    featured: true,
  },
  {
    id: "3",
    name: "Antiseptik Gel",
    price: 18000,
    image: "/placeholder.svg",
    category: "Gigiyena vositalari",
    categorySlug: "hygiene",
    description: "Qo'l uchun antiseptik gel. 99.9% mikroblarni yo'q qiladi.",
    volume: "250ml",
    inStock: true,
    featured: true,
  },
  {
    id: "4",
    name: "Mikrofiber Latta To'plami",
    price: 35000,
    image: "/placeholder.svg",
    category: "Uy tozalash vositalari",
    categorySlug: "house-cleaning",
    description: "Yuqori sifatli mikrofiber lattalar to'plami. 5 dona.",
    volume: "5 dona",
    inStock: true,
    featured: true,
  },
  {
    id: "5",
    name: "Idish Yuvish Suyuqligi",
    price: 22000,
    image: "/placeholder.svg",
    category: "Tozalash vositalari",
    categorySlug: "cleaning",
    description: "Yog'ni oson olib tashlaydi. Terini quritmaydi.",
    volume: "1L",
    inStock: true,
    featured: false,
  },
  {
    id: "6",
    name: "Pol Yuvish Vositasi",
    price: 28000,
    image: "/placeholder.svg",
    category: "Uy tozalash vositalari",
    categorySlug: "house-cleaning",
    description: "Barcha turdagi pollar uchun. Tez quritadi, dog' qoldirmaydi.",
    volume: "1.5L",
    inStock: true,
    featured: false,
  },
  {
    id: "7",
    name: "Tualet Tozalagich",
    price: 20000,
    image: "/placeholder.svg",
    category: "Tozalash vositalari",
    categorySlug: "cleaning",
    description: "Kuchli formulali tualet tozalagich. Oq rangni qaytaradi.",
    volume: "750ml",
    inStock: true,
    featured: false,
  },
  {
    id: "8",
    name: "Qog'oz Sochiqlar",
    price: 12000,
    image: "/placeholder.svg",
    category: "Gigiyena vositalari",
    categorySlug: "hygiene",
    description: "Yumshoq va mustahkam qog'oz sochiqlar. 3 qatlamli.",
    volume: "4 dona",
    inStock: true,
    featured: true,
  },
];

export const categories = [
  {
    name: "Tozalash vositalari",
    slug: "cleaning",
    image: categoryCleaning,
    productCount: 45,
  },
  {
    name: "Kir yuvish vositalari",
    slug: "laundry",
    image: categoryLaundry,
    productCount: 32,
  },
  {
    name: "Gigiyena vositalari",
    slug: "hygiene",
    image: categoryHygiene,
    productCount: 28,
  },
  {
    name: "Uy tozalash vositalari",
    slug: "house-cleaning",
    image: categoryHouse,
    productCount: 38,
  },
];

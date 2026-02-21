'use client'
import CountrySelector from "@/Components/CountrySelector";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";


const countries = [
  { code: 'us', name: 'United States' },
  { code: 'bd', name: 'Bangladesh' },
  { code: 'in', name: 'India' },
  { code: 'jp', name: 'Japan' },
  { code: 'au', name: 'Australia' },
  { code: 'fr', name: 'France' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'de', name: 'Germany' }
]

export default function Home() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('us');

  useEffect(() => {
    const fetchData = async () => {

      setLoading(true)

      const api = `${process.env.NEXT_PUBLIC_NEWS_API}&country=${selectedCountry}`

      const res = await fetch(api);
      const { results } = await res.json();
      console.log(results);
      setItems(results)

      setLoading(false)

    }
    fetchData();

  }, [selectedCountry])

  // const res = fetch(process.env.NEXT_PUBLIC_NEWS_API);
  // const { results } = res.json();

  return (
    <>
       <CountrySelector></CountrySelector>
    </>
  );
}
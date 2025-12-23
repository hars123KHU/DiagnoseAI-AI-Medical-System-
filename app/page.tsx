"use client";

import { motion } from "motion/react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg1.png"
          alt="AI Healthcare Background"
          fill
          priority
          className="object-cover"
        />
        {/* Soft overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
      </div>

      <Navbar />

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="
            max-w-4xl rounded-2xl
            border border-white/20
            bg-white/10
            px-8 py-10
            text-center
            backdrop-blur-md
            shadow-xl
            shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]
            md:px-12 md:py-14
          "
        >
          {/* Heading */}
          <h1 className="text-4xl font-bold italic leading-tight text-white md:text-5xl lg:text-4xl">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="block"
            >
              HEALTHCARE THAT LISTENS,
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="block"
            >
              CARE THAT RESPONDS.
            </motion.span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-200">
            Accurate, empathetic healthcare—from symptom assessment to care
            coordination—powered by medical-grade AI voice agents.
            <br />
            Medical-grade AI voice agents delivering accurate, compassionate care
            at every step.
          </p>

          {/* Tagline */}
          <p className="mt-6 text-sm italic text-neutral-300">
            Not your regular ChatGPT — this AI is built for healthcare.
          </p>

          {/* CTA */}
          <div className="mt-8 flex justify-center">
            <Link href="/dashboard">
              <button className="
                rounded-lg bg-white px-8 py-3
                font-semibold text-black
                transition-all duration-300
                hover:scale-105 hover:bg-neutral-200
              ">
                Get Started
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const Navbar = () => {
  const { user } = useUser();

  return (
    <nav className="relative z-20 flex w-full items-center justify-between px-6 py-4">
      <Image src="/logo2.png" alt="logo" width={180} height={90} />

      {!user ? (
        <Link href="/dashboard">
          <button className="
            rounded-lg bg-white px-6 py-2
            font-medium text-black
            transition hover:bg-neutral-200
          ">
            Login
          </button>
        </Link>
      ) : (
        <div className="flex items-center gap-4">
          <UserButton />
          <Link href="/dashboard">
            <button className="
              rounded-lg bg-white px-6 py-2
              font-medium text-black
              transition hover:bg-neutral-200
            ">
              Dashboard
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
};

import React, { useEffect } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const verifyAuth = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect("/login");
      }
    };
    
    verifyAuth();
  });

  return <>{children}</>;
}

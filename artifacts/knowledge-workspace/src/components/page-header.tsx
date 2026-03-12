import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 pb-6"
      style={{ borderBottom: "1px solid hsl(161,20%,20%,0.4)" }}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon && (
          <div className="p-2.5 rounded-xl border"
            style={{
              background: "linear-gradient(135deg, hsl(161,65%,42%,0.15) 0%, hsl(150,80%,50%,0.08) 100%)",
              borderColor: "hsl(161,65%,42%,0.3)",
              color: "hsl(150,80%,60%)",
              boxShadow: "inset 0 0 12px hsl(161,65%,42%,0.1)"
            }}>
            {icon}
          </div>
        )}
        <h1 className="text-3xl font-bold"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, hsl(150,60%,80%) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
          {title}
        </h1>
      </div>
      <p className="text-muted-foreground text-base ml-[3.25rem] max-w-2xl leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

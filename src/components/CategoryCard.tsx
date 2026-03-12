import { motion } from "framer-motion";
import { Monitor, Briefcase, ShoppingCart, Megaphone, Wrench, Truck, Factory } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Monitor, Briefcase, ShoppingCart, Megaphone, Wrench, Truck, Factory,
};

interface CategoryCardProps {
  nome: string;
  icone: string;
  quantidade: number;
  index: number;
}

const CategoryCard = ({ nome, icone, quantidade, index }: CategoryCardProps) => {
  const Icon = iconMap[icone] || Briefcase;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer border border-border"
    >
      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-accent-foreground" />
      </div>
      <p className="font-heading font-semibold text-sm text-foreground">{nome}</p>
      <p className="text-secondary font-bold text-lg">{quantidade}</p>
      <p className="text-muted-foreground text-xs">vagas</p>
    </motion.div>
  );
};

export default CategoryCard;

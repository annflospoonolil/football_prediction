import { motion } from "framer-motion";

export default function MatchCard({ match, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 cursor-pointer"
    >
      <h2 className="text-xl font-bold">
        {match.teamA} vs {match.teamB}
      </h2>
      <p className="text-gray-300">Tap to predict ⚽</p>
    </motion.div>
  );
}

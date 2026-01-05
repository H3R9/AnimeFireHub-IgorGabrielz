import React from 'react';
import { Anime } from '../types';
import { Play, Star } from 'lucide-react';

interface AnimeGridProps {
  animes: Anime[];
  onSelect: (anime: Anime) => void;
  isLoading: boolean;
}

const AnimeGrid: React.FC<AnimeGridProps> = ({ animes, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-pulse">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl h-80 w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {animes.map((anime) => (
        <div 
          key={anime.id} 
          className="group relative bg-gray-900 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg border border-gray-800 hover:border-orange-500"
          onClick={() => onSelect(anime)}
        >
          <div className="aspect-[2/3] w-full relative">
            <img 
              src={anime.thumbnail.includes("http") ? anime.thumbnail : `https://picsum.photos/300/450?random=${anime.id}`} 
              alt={anime.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/300/450?random=${anime.id}`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            
            <div className="absolute top-2 right-2 bg-orange-600 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <Star size={10} fill="currentColor" />
              {anime.rating || "N/A"}
            </div>
          </div>
          
          <div className="p-4 absolute bottom-0 w-full">
            <h3 className="text-white font-bold truncate text-lg drop-shadow-md">{anime.title}</h3>
            <div className="flex gap-2 text-xs text-gray-300 mt-1">
              <span>{anime.year}</span>
              <span>•</span>
              <span className="truncate">{anime.genres?.[0]}</span>
            </div>
          </div>

          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <div className="bg-orange-500 p-3 rounded-full text-white shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                <Play fill="currentColor" />
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimeGrid;
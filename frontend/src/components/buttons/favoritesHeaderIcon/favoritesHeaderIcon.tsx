import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LikeSVG from "../../../icons/like.svg?react";
import { showFavorites } from "../../../services/cookiesServices";
import styles from "./favoritesHeaderIcon.module.css";

export function FavoritesHeaderIcon() {
    const navigate = useNavigate();
    const [hasFavorites, setHasFavorites] = useState(false);

    useEffect(() => {
        const loadFavoritesStatus = async () => {
            try {
                const favorites = await showFavorites();
                setHasFavorites(favorites && favorites.length > 0);
            } catch (error) {
                console.error('Error loading favorites status:', error);
                setHasFavorites(false);
            }
        };

        loadFavoritesStatus();

        // Слушаем изменения избранного
        const handleFavoritesUpdate = () => {
            loadFavoritesStatus();
        };

        window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
        window.addEventListener('storage', handleFavoritesUpdate);

        return () => {
            window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
            window.removeEventListener('storage', handleFavoritesUpdate);
        };
    }, []);

    const handleClick = () => {
        navigate('/favorites');
    };

    return (
        <div 
            className={styles.favoritesIcon} 
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
        >
            <LikeSVG className={hasFavorites ? styles.like_svg_liked : styles.like_svg} />
        </div>
    );
}




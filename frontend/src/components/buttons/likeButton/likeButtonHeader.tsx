import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./likeButtonHeader.module.css";
import LikeSVG from "../../../icons/like.svg?react";
import { showFavorites, updateFavorites } from "../../../services/cookiesServices";

type Props = {
    id: number
}

export function LikeButtonHeader(props: Props) {
    const [searchParams] = useSearchParams();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const params = [
        searchParams.get('in_start') ? new Date(searchParams.get('in_start')!) : null,
        searchParams.get('in_end') ? new Date(searchParams.get('in_end')!) : null,
    ];
    
    // Загружаем состояние избранного при монтировании и изменении id
    useEffect(() => {
        const loadFavoriteStatus = async () => {
            try {
                const favorites = await showFavorites();
                setIsFavorite(favorites?.some(item => item.id === props.id) || false);
            } catch (error) {
                console.error('Error loading favorite status:', error);
            }
        };
        loadFavoriteStatus();
    }, [props.id]);
    
    const handleClick = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await updateFavorites(props.id, params[0]?.toISOString(), params[1]?.toISOString());
            // Обновляем состояние после изменения
            const favorites = await showFavorites();
            setIsFavorite(favorites?.some(item => item.id === props.id) || false);
        } catch (error) {
            console.error('Error updating favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <button 
            className={styles.like} 
            onClick={handleClick}
            disabled={isLoading}
        >
            <LikeSVG className={isFavorite ? styles.like_svg_liked : styles.like_svg} />
        </button>
    )
}




import { useState, useEffect, useCallback } from 'react';

// ─── Typewriter Hook ───
export function useTypewriter(text, speed = 20) {
    const [displayed, setDisplayed] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isDone, setIsDone] = useState(false);

    useEffect(() => {
        if (!text) {
            setDisplayed('');
            setIsDone(true);
            return;
        }

        setDisplayed('');
        setIsTyping(true);
        setIsDone(false);
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayed(text.slice(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
                setIsTyping(false);
                setIsDone(true);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    const skipToEnd = useCallback(() => {
        setDisplayed(text);
        setIsTyping(false);
        setIsDone(true);
    }, [text]);

    return { displayed, isTyping, isDone, skipToEnd };
}

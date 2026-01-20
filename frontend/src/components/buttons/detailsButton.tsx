import { Button } from "@mantine/core"

interface Props {
    handleNavigate: string
}

export function DetailsButton(props: Props) {
    return (
        <Button
        
            // onTouchStart={(e) => e.preventDefault()}  //че то там для ios и отключения прокрутки
            m={10}
            color="var(--mantine-color-sberGreenColor-9)"
        >
            Просмотреть
        </Button>);
}
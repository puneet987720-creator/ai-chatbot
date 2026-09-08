import { View, Text} from 'react-native';
import {Link} from "expo-router";

export default function ChatHistory({title, id}: {title: string, id: string})
{
    return (
        <Link href={`/(drawer)/chatTab?id=${encodeURIComponent(id)}`} className="flex-auto rounded-2xl justify-center align-middle m-2 p-4">
            <Text>{title}</Text>
        </Link>
    );
}
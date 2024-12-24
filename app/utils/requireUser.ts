import { redirect } from 'next/navigation';
import {getKindeServerSession} from '@kinde-oss/kinde-auth-nextjs/server';

export const requireUser = async () => {
    const {getUser} = getKindeServerSession();
    const user =  await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }
    return user;

}   
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()


async function main() {
    // // ... you will write your Prisma Client queries here
    const results = await prisma.user.findMany({
        include: {
            messagesSent: true,
            messagesReceived: true,
        }
    });

    // await prisma.user.create({
    //     data: {
    //         name: 'Jared2',
    //         number: '+16196037722',
    //     }
    // });

    //     // ... you will write your Prisma Client queries here
    //     const allUsersAfter = await prisma.user.findMany()
    //     console.log(allUsersAfter)
    // await prisma.message.create({
    //     data: {
    //         senderId: 1,
    //         receiverId: 3,
    //         body: 'Hello World',
    //     }
    // });
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
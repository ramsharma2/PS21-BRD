import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create a user (if needed, otherwise rely on Clerk ID from context)
    // For local dev, we might assume a fixed user ID if auth is mocked or we can just proceed with a dummy ID
    const userId = 'user_2bdZ0...'; // This should ideally match your Clerk User ID if testing with Auth

    // 2. Clear existing demo data
    try {
        const existingDemo = await prisma.project.findFirst({ where: { name: 'Demo E-Commerce BRD' } });
        if (existingDemo) {
            console.log('🗑️  Deleting existing demo project...');
            await prisma.project.delete({ where: { id: existingDemo.id } });
        }
    } catch (e) {
        console.warn('⚠️  Could not clear old data (might not exist).');
    }

    // 3. Create Demo Project
    const project = await prisma.project.create({
        data: {
            name: 'Demo E-Commerce BRD',
            description: 'A comprehensive BRD for a modern e-commerce platform upgrade.',
            userId: userId, // Ensure this matches your logged-in user ID for visibility
            status: 'completed',
        },
    });

    console.log(`✅ Project created: ${project.id}`);

    // 4. Add Sources
    await prisma.source.createMany({
        data: [
            {
                projectId: project.id,
                sourceType: 'document',
                rawContent: 'The system must support high-volume transactions during peak sales events like Black Friday. Load balancing is critical.',
                metadata: JSON.stringify({ fileName: 'Architecture_Specs.pdf', sourceLabel: 'Tech Specs' }),
                ingestedAt: new Date(),
            },
            {
                projectId: project.id,
                sourceType: 'manual',
                rawContent: 'Users need to be able to checkout as guests without creating an account. This is a top priority for conversion rates.',
                metadata: JSON.stringify({ sourceLabel: 'Stakeholder Interview' }),
                ingestedAt: new Date(),
            },
        ],
    });

    console.log('✅ Sources added');

    // 5. Create BRD
    const brd = await prisma.bRD.create({
        data: {
            projectId: project.id,
            version: 1,
            executiveSummary: "This document outlines the requirements for the new E-Commerce platform...",
            scope: "In-scope: User auth, Product catalog, Cart, Checkout. Out-of-scope: Legacy data migration.",
            functionalRequirements: "- The system shall allow guest checkout.\n- The system shall support OAuth login (Google, Facebook).",
            nonFunctionalRequirements: "- The system must handle 10,000 concurrent users.\n- Page load time must be under 2 seconds.",
            businessObjectives: "",
            stakeholderAnalysis: "",
            assumptions: "",
            constraints: "",
            risks: "",
            successMetrics: "",
            timeline: "",
            glossary: "",
        },
    });

    console.log(`✅ BRD generated: ${brd.id}`);

    // 6. Create Extractions (for RTM)
    const sourceManual = await prisma.source.findFirst({ where: { projectId: project.id, sourceType: 'manual' } });
    const sourceDoc = await prisma.source.findFirst({ where: { projectId: project.id, sourceType: 'document' } });

    await prisma.extraction.createMany({
        data: [
            {
                projectId: project.id,
                content: "The system shall allow guest checkout.",
                category: "functional_req",
                priority: "High",
                citations: JSON.stringify([{ sourceId: sourceManual?.id || '', fileName: 'Manual' }]),
            },
            {
                projectId: project.id,
                content: "The system must handle 10,000 concurrent users.",
                category: "nonfunctional_req",
                priority: "Critical",
                citations: JSON.stringify([{ sourceId: sourceDoc?.id || '', fileName: 'Architecture_Specs.pdf' }]),
            },
        ],
    });

    console.log('✅ RTM data populated');

    // 7. Create Conflicts
    await prisma.conflict.create({
        data: {
            projectId: project.id,
            description: "[MEDIUM] Security vs Usability: Guest checkout requirement conflicts with 'All users must be verified' security policy.",
            status: 'open',
            itemA: 'Guest Checkout',
            itemB: 'All users must be verified',
            sourceA: '',
            sourceB: ''
        },
    });

    console.log('✅ Conflicts simulated');
    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

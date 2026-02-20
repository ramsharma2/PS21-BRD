import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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
                metadata: { fileName: 'Architecture_Specs.pdf', sourceLabel: 'Tech Specs' },
                ingestedAt: new Date(),
            },
            {
                projectId: project.id,
                sourceType: 'manual',
                rawContent: 'Users need to be able to checkout as guests without creating an account. This is a top priority for conversion rates.',
                metadata: { sourceLabel: 'Stakeholder Interview' },
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
            status: 'completed',
            content: {
                "Executive Summary": "This document outlines the requirements for the new E-Commerce platform...",
                "Scope": "In-scope: User auth, Product catalog, Cart, Checkout. Out-of-scope: Legacy data migration.",
                "Functional Requirements": "- The system shall allow guest checkout.\n- The system shall support OAuth login (Google, Facebook).",
                "Non-Functional Requirements": "- The system must handle 10,000 concurrent users.\n- Page load time must be under 2 seconds.",
            },
        },
    });

    console.log(`✅ BRD generated: ${brd.id}`);

    // 6. Create Extractions (for RTM)
    await prisma.extraction.createMany({
        data: [
            {
                projectId: project.id,
                content: "The system shall allow guest checkout.",
                category: "functional_req",
                priority: "High",
                sourceId: (await prisma.source.findFirst({ where: { projectId: project.id, sourceType: 'manual' } }))?.id || '',
            },
            {
                projectId: project.id,
                content: "The system must handle 10,000 concurrent users.",
                category: "nonfunctional_req",
                priority: "Critical",
                sourceId: (await prisma.source.findFirst({ where: { projectId: project.id, sourceType: 'document' } }))?.id || '',
            },
        ],
    });

    console.log('✅ RTM data populated');

    // 7. Create Conflicts
    await prisma.conflict.create({
        data: {
            projectId: project.id,
            description: "Security vs Usability: Guest checkout requirement conflicts with 'All users must be verified' security policy.",
            status: 'open',
            severity: 'medium',
            detectedAt: new Date(),
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

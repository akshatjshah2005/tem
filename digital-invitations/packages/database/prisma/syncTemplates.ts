import { PrismaClient, Prisma } from '@prisma/client';
import { loadTemplateDefinitions } from './templateDefinitions';

const prisma = new PrismaClient();

/**
 * Upserts every template definition found in the repository templates folder
 * (one config.json per template directory) into the database. Category is
 * resolved by the definition slug prefix (e.g. wedding-classic-gold maps to
 * category slug "wedding"), falling back to the existing template row's
 * category so nothing is lost.
 *
 * Safe to run repeatedly - it only updates template metadata/configuration and
 * never touches invitations, guests or events.
 */
async function main() {
  const definitions = loadTemplateDefinitions();

  if (definitions.length === 0) {
    console.log('No template definitions found. Nothing to sync.');
    return;
  }

  let created = 0;
  let updated = 0;

  for (const def of definitions) {
    const categorySlug = def.slug.split('-')[0];
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    const existing = await prisma.template.findUnique({ where: { slug: def.slug } });

    if (!category && !existing) {
      console.warn(`Skipping "${def.slug}": category "${categorySlug}" not found`);
      continue;
    }

    const data = {
      name: def.name,
      description: def.description ?? null,
      version: def.version ?? '1.0.0',
      isPremium: def.isPremium ?? false,
      features: (def.features ?? {}) as Prisma.InputJsonValue,
      variables: (def.variables ?? {}) as Prisma.InputJsonValue,
      editableFields: (def.editableFields ?? {}) as Prisma.InputJsonValue,
      config: (def.config ?? {}) as Prisma.InputJsonValue
    };

    if (existing) {
      await prisma.template.update({
        where: { slug: def.slug },
        data: category && category.id !== existing.categoryId ? { ...data, categoryId: category.id } : data
      });
      updated += 1;
      console.log(`Updated template: ${def.slug}`);
    } else {
      await prisma.template.create({
        data: {
          ...data,
          slug: def.slug,
          categoryId: category!.id,
          status: 'PUBLISHED'
        }
      });
      created += 1;
      console.log(`Created template: ${def.slug}`);
    }
  }

  console.log(`Template sync complete. created=${created} updated=${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const organizationRepository = require('../organization.repository');
const InMemoryProvider = require('../../../dal/providers/in-memory/in-memory.provider');

describe('OrganizationRepository', () => {
    beforeEach(() => {
        organizationRepository.provider = new InMemoryProvider('organization');
    });

    it('should create an organization', async () => {
        const orgData = { name: 'Test Org', social_name: 'Test Org Inc.' };
        const org = await organizationRepository.create(orgData);
        expect(org).toHaveProperty('organization_id');
        expect(org.name).toBe(orgData.name);
    });

    it('should find an organization by id', async () => {
        const orgData = { name: 'Test Org', social_name: 'Test Org Inc.' };
        const createdOrg = await organizationRepository.create(orgData);
        const foundOrg = await organizationRepository.findById(createdOrg.organization_id);
        expect(foundOrg).toEqual(createdOrg);
    });

    it('should update an organization', async () => {
        const orgData = { name: 'Test Org', social_name: 'Test Org Inc.' };
        const createdOrg = await organizationRepository.create(orgData);
        const updatedData = { name: 'New Test Org' };
        const updatedOrg = await organizationRepository.update(createdOrg.organization_id, updatedData);
        expect(updatedOrg.name).toBe(updatedData.name);
    });

    it('should soft delete an organization', async () => {
        const orgData = { name: 'Test Org', social_name: 'Test Org Inc.' };
        const createdOrg = await organizationRepository.create(orgData);
        await organizationRepository.softDelete(createdOrg.organization_id);
        const foundOrg = await organizationRepository.findById(createdOrg.organization_id);
        expect(foundOrg).toBeUndefined();
    });
});

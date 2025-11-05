const petRepository = require('../pet.repository');
const InMemoryProvider = require('../../../dal/providers/in-memory/in-memory.provider');

describe('PetRepository', () => {
    let tutorProvider;

    beforeEach(() => {
        petRepository.provider = new InMemoryProvider('pet');
        tutorProvider = new InMemoryProvider('tutor');

        // Mock the knex join
        petRepository.findWithTutor = async (filter, { organizationId }) => {
            const pets = await petRepository.provider.find(filter, { organizationId });
            const tutors = await tutorProvider.find({}, { organizationId });
            const petsWithTutors = pets.data.map(pet => {
                const tutor = tutors.data.find(t => t.tutor_id === pet.tutor_id);
                return { ...pet, tutor_name: tutor ? tutor.name : null };
            });
            return { data: petsWithTutors, pagination: pets.pagination };
        };
    });

    it('should create a pet', async () => {
        const petData = { name: 'Bidu', species: 'Cão', tutor_id: 1 };
        const pet = await petRepository.create(petData);
        expect(pet).toHaveProperty('pet_id');
        expect(pet.name).toBe(petData.name);
    });

    it('should find a pet by id', async () => {
        const petData = { name: 'Bidu', species: 'Cão', tutor_id: 1 };
        const createdPet = await petRepository.create(petData);
        const foundPet = await petRepository.findById(createdPet.pet_id);
        expect(foundPet).toEqual(createdPet);
    });

    it('should update a pet', async () => {
        const petData = { name: 'Bidu', species: 'Cão', tutor_id: 1 };
        const createdPet = await petRepository.create(petData);
        const updatedData = { name: 'Snoopy' };
        const updatedPet = await petRepository.update(createdPet.pet_id, updatedData);
        expect(updatedPet.name).toBe(updatedData.name);
    });

    it('should soft delete a pet', async () => {
        const petData = { name: 'Bidu', species: 'Cão', tutor_id: 1 };
        const createdPet = await petRepository.create(petData);
        await petRepository.softDelete(createdPet.pet_id);
        const foundPet = await petRepository.findById(createdPet.pet_id);
        expect(foundPet).toBeUndefined();
    });

    it('should find a pet with tutor', async () => {
        await tutorProvider.create({ tutor_id: 1, name: 'John Doe' });
        await petRepository.create({ name: 'Bidu', species: 'Cão', tutor_id: 1 });
        const result = await petRepository.findWithTutor({}, {});
        expect(result.data[0]).toHaveProperty('tutor_name', 'John Doe');
    });
});

const tutorRepository = require('../tutor.repository');
const InMemoryProvider = require('../../../dal/providers/in-memory/in-memory.provider');

describe('TutorRepository', () => {
    beforeEach(() => {
        tutorRepository.provider = new InMemoryProvider('tutor');
    });

    it('should create a tutor', async () => {
        const tutorData = { name: 'John Doe', email: 'john.doe@example.com' };
        const tutor = await tutorRepository.create(tutorData);
        expect(tutor).toHaveProperty('tutor_id');
        expect(tutor.name).toBe(tutorData.name);
    });

    it('should find a tutor by id', async () => {
        const tutorData = { name: 'John Doe', email: 'john.doe@example.com' };
        const createdTutor = await tutorRepository.create(tutorData);
        const foundTutor = await tutorRepository.findById(createdTutor.tutor_id);
        expect(foundTutor).toEqual(createdTutor);
    });

    it('should update a tutor', async () => {
        const tutorData = { name: 'John Doe', email: 'john.doe@example.com' };
        const createdTutor = await tutorRepository.create(tutorData);
        const updatedData = { name: 'Jane Doe' };
        const updatedTutor = await tutorRepository.update(createdTutor.tutor_id, updatedData);
        expect(updatedTutor.name).toBe(updatedData.name);
    });

    it('should soft delete a tutor', async () => {
        const tutorData = { name: 'John Doe', email: 'john.doe@example.com' };
        const createdTutor = await tutorRepository.create(tutorData);
        await tutorRepository.softDelete(createdTutor.tutor_id);
        const foundTutor = await tutorRepository.findById(createdTutor.tutor_id);
        expect(foundTutor).toBeUndefined();
    });
});

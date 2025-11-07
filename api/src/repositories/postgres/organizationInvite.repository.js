const BaseRepository = require('../../dal/repositories/base.repository');
const knex = require('../../dal/query-builder/knex');

const tableName = 'organization_invite';

class OrganizationInviteRepository {
    constructor() {
        // primary key is invite_code, and we don't have nenabled or dlastupdate columns
        this.provider = new BaseRepository(tableName, 'invite_code', false, false);
    }

    findValidInvite(inviteCode) {
        return knex(tableName)
            .where({
                invite_code: inviteCode,
                is_used: false
            })
            .first();
    }

    markAsUsed(inviteCode, organizationId, trx) {
        return knex(tableName)
            .transacting(trx)
            .where({ invite_code: inviteCode })
            .update({
                is_used: true,
                organization_id: organizationId,
                dlastupdate: new Date()
            });
    }
}

module.exports = new OrganizationInviteRepository();

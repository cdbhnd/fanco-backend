import { IPollVote } from "../entities/";

export interface IPollVoteRepository {
    find(query: any): Promise<IPollVote[]>;
    create(entity: IPollVote): Promise<IPollVote>;
    delete(entity: IPollVote): Promise<boolean>;
    findOne(query: any): Promise<IPollVote>;
    update(entity: IPollVote): Promise<IPollVote>
}
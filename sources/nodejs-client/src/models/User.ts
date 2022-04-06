import { IndustryType } from '../../../../../shared/enums/industry-type.enum';
import { MongoObject } from './MongoObject';

class UserCoaching {
    // If the webhook tells us a coaching has been scheduled for an user
    isCoachingScheduledWebhookInput?: boolean;
    // If the interface tells us a coaching has been scheduled for an user
    isCoachingScheduledUserInput?: boolean;
    scheduledAt?: Date;
    freeCoachingAmount: number;
    constructor(businessPlanInvestment) {
        this.isCoachingScheduledUserInput =
            businessPlanInvestment?.isCoachingScheduledUserInput;
        this.isCoachingScheduledWebhookInput =
            businessPlanInvestment?.isCoachingScheduledWebhookInput;
        this.scheduledAt = businessPlanInvestment?.scheduledAt;
        this.freeCoachingAmount = businessPlanInvestment?.freeCoachingAmount;
    }
}
class UserModel extends MongoObject {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
    paidIndustryTypes?: [IndustryType];
    coaching?: UserCoaching;
    constructor(user) {
        super(user);
        this.firstName = user?.firstName;
        this.lastName = user?.lastName;
        this.email = user?.email;
        this.password = user?.password;
        this.phoneNumber = user?.phoneNumber;
        this.paidIndustryTypes = user?.paidIndustryTypes;
        this.coaching = user?.coaching
            ? new UserCoaching(user.coaching)
            : undefined;
    }
}

export { UserModel, UserCoaching };

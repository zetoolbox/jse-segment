import { ObjectId } from 'bson';
import { Industry } from '../../../../../shared/enums/industry.enum';
import { LegalStatus } from '../../../../../shared/enums/legal-status.enum';
import { ProjectType } from '../../../../../shared/enums/project-type.enum';
import { OfferType } from '../../../../../shared/enums/offer-type.enum';
import { Period } from '../../../../../shared/enums/period.enum';
import { ProgressLevelStatus } from '../../../../../shared/enums/progress-level-status.enum';
import { MongoObject } from './MongoObject';
import db from '../../../common/app-modules/db-app-module';
import { DbCollection } from '../../../enums/db-collection.enum';
import { FileModel } from './File';
import axios from 'axios';
import { Route } from '../../../../../shared/enums/route.enum';
import { getBpAsBase64Pdf } from '../../utils/pdf-render';
import { FileType } from '../../../../../shared/enums/file-type.enum';
import { randomBytes } from 'crypto';
import { SupplierCredit } from '../../../../../shared/enums/supplier-credit.enum';
import { CustomerCredit } from '../../../../../shared/enums/customer-credit.enum';
import { IndustryType } from '../../../../../shared/enums/industry-type.enum';
import { IndustryMainActivity } from '../../../../../shared/enums/industry-main-activity.enum';
import { SalesMethod } from '../../../../../shared/enums/sales-method.enum';
import { CommunicationMethod } from '../../../../../shared/enums/communication-method.enum';
import { JobContractType } from '../../../../../shared/enums/job-contract-type.enum';
import { PartnersCategory } from '../../../../../shared/enums/partners-category.enum';
import { VatRateSales } from '../../../../../shared/enums/vat-rate-sales.enum';
import { VatRateProductionCost } from '../../../../../shared/enums/vat-rate-production-cost.enum';
import { VatStatus } from '../../../../../shared/enums/vat-status.enum';
import { SeasonalityType } from '../../../../../shared/enums/seasonality-type.enum';
import { GeneralCost } from '../../../../../shared/enums/general-cost.enum';
import { Investment } from '../../../../../shared/enums/investment.enum';
import { Funding } from '../../../../../shared/enums/funding.enum';

const setField = (
    value,
    type,
    setEmptyValue: boolean,
    isArray: boolean = false
) => {
    if (type === 'boolean') {
        return setEmptyValue ? !!value : value;
    }
    if (value) {
        if (isArray) {
            return value.map((arrayValue) => new type(arrayValue));
        }
        return new type(value);
    } else {
        const emptyValue = isArray ? [] : new type();
        return setEmptyValue ? emptyValue : undefined;
    }
};

class InputValidation {
    isModified: boolean;
    isValidated: boolean;
    constructor(inputValidation) {
        this.isModified = inputValidation?.isModified;
        this.isValidated = inputValidation?.isValidated;
    }
}
class PrimitiveValidation<type> extends InputValidation {
    value: type;
    constructor(primitiveValidation) {
        super(primitiveValidation);
        this.value = primitiveValidation?.value;
    }
}
class BusinessPlanInvestment extends InputValidation {
    name?: Investment;
    amount?: number;
    constructor(businessPlanInvestment) {
        super(businessPlanInvestment);
        this.name = businessPlanInvestment?.name;
        this.amount = businessPlanInvestment?.amount;
    }
}

class BusinessPlanSnapshotHistory extends InputValidation {
    id?: ObjectId;
    createdAt?: Date;
    constructor(businessPlanSnapshotHistory) {
        super(businessPlanSnapshotHistory);
        this.id = businessPlanSnapshotHistory?.id;
        this.createdAt = businessPlanSnapshotHistory?.createdAt || new Date();
    }
}

class BusinessPlanOffer extends InputValidation {
    name: string;
    price: number;
    offerType: OfferType;
    description: string;
    salesNumber: number;
    salesPerYear: number;
    salesFrequency: Period;
    vatRate: VatRateSales;
    productionCost: number;
    vatStatusProductionCost: VatStatus;
    vatRateProductionCost: VatRateProductionCost;
    constructor(businessPlanOffer) {
        super(businessPlanOffer);
        this.name = businessPlanOffer?.name;
        this.price = businessPlanOffer?.price;
        this.salesNumber = businessPlanOffer?.salesNumber;
        this.salesFrequency = businessPlanOffer?.salesFrequency;
        this.description = businessPlanOffer?.description;
        this.offerType = businessPlanOffer?.offerType;
        this.vatRate = businessPlanOffer?.vatRate;
        this.productionCost = businessPlanOffer?.productionCost;
        this.vatStatusProductionCost =
            businessPlanOffer?.vatStatusProductionCost;
        this.vatRateProductionCost = businessPlanOffer?.vatRateProductionCost;
    }
}

class BusinessPlanProjectOwner extends InputValidation {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    constructor(businessPlanProjectOwner) {
        super(businessPlanProjectOwner);
        this.firstName = businessPlanProjectOwner?.firstName;
        this.lastName = businessPlanProjectOwner?.lastName;
        this.email = businessPlanProjectOwner?.email;
        this.phoneNumber = businessPlanProjectOwner?.phoneNumber;
    }
}

class BusinessPlanCommunicationMethod extends InputValidation {
    name?: CommunicationMethod | string;
    budget?: number;
    frequency?: Period;
    description?: string;
    constructor(businessPlanCommunicationMethod) {
        super(businessPlanCommunicationMethod);
        this.name = businessPlanCommunicationMethod?.name;
        this.budget = businessPlanCommunicationMethod?.budget;
        this.frequency = businessPlanCommunicationMethod?.frequency;
        this.description = businessPlanCommunicationMethod?.description;
    }
}

class BusinessPlanEmployee extends InputValidation {
    position?: string;
    recruitmentDate?: Date;
    jobContractType?: JobContractType;
    contractDurationInMonths?: number;
    salary?: number;
    salaryFrequency?: Period;
    constructor(businessPlanEmployee) {
        super(businessPlanEmployee);
        this.position = businessPlanEmployee?.position;
        this.recruitmentDate = businessPlanEmployee?.recruitmentDate;
        this.jobContractType = businessPlanEmployee?.jobContractType;
        this.contractDurationInMonths =
            businessPlanEmployee?.contractDurationInMonths;
        this.salary = businessPlanEmployee?.salary;
        this.salaryFrequency = businessPlanEmployee?.salaryFrequency;
    }
}

class BusinessPlanPartner extends InputValidation {
    category?: PartnersCategory | string;
    name?: string;
    progressLevel?: ProgressLevelStatus;
    constructor(businessPlanPartner) {
        super(businessPlanPartner);
        this.category = businessPlanPartner?.category;
        this.name = businessPlanPartner?.name;
        this.progressLevel = businessPlanPartner?.progressLevel;
    }
}

class BusinessPlanSupplier extends InputValidation {
    name?: string;
    category?: string;
    constructor(businessPlanSupplier) {
        super(businessPlanSupplier);
        this.name = businessPlanSupplier?.name;
        this.category = businessPlanSupplier?.category;
    }
}

class BusinessPlanFounder extends InputValidation {
    fullName?: string;
    birthDate?: Date;
    currentJob?: string;
    career?: string;
    salary?: number;
    salaryFrequency?: Period;
    firstSalaryDate?: Date;
    constructor(businessPlanFounder) {
        super(businessPlanFounder);
        this.fullName = businessPlanFounder?.fullName;
        this.birthDate = businessPlanFounder?.birthDate;
        this.currentJob = businessPlanFounder?.currentJob;
        this.career = businessPlanFounder?.career;
        this.salary = businessPlanFounder?.salary;
        this.salaryFrequency = businessPlanFounder?.salaryFrequency;
        this.firstSalaryDate = businessPlanFounder?.firstSalaryDate;
    }
}

class BusinessPlanCompetitor extends InputValidation {
    name?: string;
    strength?: string;
    weakness?: string;
    constructor(businessPlanCompetitor) {
        super(businessPlanCompetitor);
        this.name = businessPlanCompetitor?.name;
        this.strength = businessPlanCompetitor?.strength;
        this.weakness = businessPlanCompetitor?.weakness;
    }
}

class BusinessPlanGeneralCost extends InputValidation {
    name?: GeneralCost;
    amount?: number;
    costFrequency?: Period;
    constructor(businessPlanGeneralCost) {
        super(businessPlanGeneralCost);
        this.name = businessPlanGeneralCost?.name;
        this.amount = businessPlanGeneralCost?.amount;
        this.costFrequency = businessPlanGeneralCost?.costFrequency;
    }
}

class BusinessPlanBankLoan extends InputValidation {
    loanDurationInYears?: number;
    loanAnnualRate?: number;
    constructor(businessPlanBankLoan) {
        super(businessPlanBankLoan);
        this.loanDurationInYears = businessPlanBankLoan?.loanDurationInYears;
        this.loanAnnualRate = businessPlanBankLoan?.loanAnnualRate;
    }
}

class BusinessPlanFunding extends InputValidation {
    name?: Funding;
    amount?: number;
    constructor(businessPlanFunding) {
        super(businessPlanFunding);
        this.name = businessPlanFunding?.name;
        this.amount = businessPlanFunding?.amount;
    }
}

class BusinessPlanPersonalInvestment extends InputValidation {
    ownerName?: string;
    amount?: number;
    constructor(businessPlanPersonalInvestment) {
        super(businessPlanPersonalInvestment);
        this.ownerName = businessPlanPersonalInvestment?.ownerName;
        this.amount = businessPlanPersonalInvestment?.amount;
    }
}

class BusinessPlanInKindContribution extends InputValidation {
    ownerName?: string;
    investmentName?: string;
    amount?: number;
    constructor(businessPlanInKindContribution) {
        super(businessPlanInKindContribution);
        this.ownerName = businessPlanInKindContribution?.ownerName;
        this.investmentName = businessPlanInKindContribution?.investmentName;
        this.amount = businessPlanInKindContribution?.amount;
    }
}

class BusinessPlanSalesSeasonality extends InputValidation {
    seasonalityType?: SeasonalityType;
    salesRate?: number;
    constructor(businessPlanSalesSeasonality) {
        super(businessPlanSalesSeasonality);
        this.seasonalityType = businessPlanSalesSeasonality?.seasonalityType;
        this.salesRate = businessPlanSalesSeasonality?.salesRate;
    }
}

class BusinessPlanGeneralCostsSeasonality extends InputValidation {
    generalCostName?: GeneralCost;
    seasonality?: [number];
    constructor(businessPlanGeneralCostsSeasonality) {
        super(businessPlanGeneralCostsSeasonality);
        this.generalCostName =
            businessPlanGeneralCostsSeasonality?.generalCostName;
        this.seasonality = businessPlanGeneralCostsSeasonality?.seasonality;
    }
}

class BusinessPlanProjectLocation {
    latitude?: number;
    longitude?: number;
    irisCode?: string;
    address?: string;
    postCode?: string;
    city?: string;
    constructor(businessPlanProjectLocation) {
        this.latitude = businessPlanProjectLocation?.latitude;
        this.longitude = businessPlanProjectLocation?.longitude;
        this.irisCode = businessPlanProjectLocation?.irisCode;
        this.address = businessPlanProjectLocation?.address;
        this.postCode = businessPlanProjectLocation?.postCode;
        this.city = businessPlanProjectLocation?.city;
    }
}

class BusinessPlanProjectAreaInformations {
    womenCount?: number;
    menCount?: number;
    population_0_14?: number;
    population_15_29?: number;
    population_30_44?: number;
    population_45_59?: number;
    population_60_74?: number;
    population_75?: number;
    activeCount?: number;
    inactiveCount?: number;
    studentCount?: number;
    retiredCount?: number;
    unemployedCount?: number;
    constructor(businessPlanProjectAreaInformations) {
        this.womenCount = businessPlanProjectAreaInformations?.womenCount;
        this.menCount = businessPlanProjectAreaInformations?.menCount;
        this.population_0_14 =
            businessPlanProjectAreaInformations?.population_0_14;
        this.population_15_29 =
            businessPlanProjectAreaInformations?.population_15_29;
        this.population_30_44 =
            businessPlanProjectAreaInformations?.population_30_44;
        this.population_45_59 =
            businessPlanProjectAreaInformations?.population_45_59;
        this.population_60_74 =
            businessPlanProjectAreaInformations?.population_60_74;
        this.population_75 = businessPlanProjectAreaInformations?.population_75;
        this.activeCount = businessPlanProjectAreaInformations?.activeCount;
        this.inactiveCount = businessPlanProjectAreaInformations?.inactiveCount;
        this.studentCount = businessPlanProjectAreaInformations?.studentCount;
        this.retiredCount = businessPlanProjectAreaInformations?.retiredCount;
        this.unemployedCount =
            businessPlanProjectAreaInformations?.unemployedCount;
    }
}

class BusinessPlanModel extends MongoObject {
    userId?: ObjectId;
    isBeingGenerated?: boolean;
    title?: PrimitiveValidation<string>;
    projectOwner?: BusinessPlanProjectOwner;
    projectLocation?: BusinessPlanProjectLocation;
    projectAreaInformations?: BusinessPlanProjectAreaInformations;
    shortDescription?: PrimitiveValidation<string>;
    longDescription?: PrimitiveValidation<string>;
    industryName?: PrimitiveValidation<Industry | string>;
    industryType?: PrimitiveValidation<IndustryType | string>;
    industryMainActivity?: PrimitiveValidation<IndustryMainActivity | string>;
    investments?: BusinessPlanInvestment[];
    offers?: BusinessPlanOffer[];
    snapshotsHistory: BusinessPlanSnapshotHistory[];
    legalStatus?: PrimitiveValidation<LegalStatus>;
    projectType?: PrimitiveValidation<ProjectType>;
    salesMethods?: PrimitiveValidation<SalesMethod | string>[];
    communicationMethods?: BusinessPlanCommunicationMethod[];
    launchDate?: PrimitiveValidation<Date>;
    employeesFirstYear?: BusinessPlanEmployee[];
    employeesNextYears?: BusinessPlanEmployee[];
    willRecruitFirstYear?: boolean;
    willRecruitNextYears?: boolean;
    shortTermGoal?: PrimitiveValidation<string>;
    middleTermGoal?: PrimitiveValidation<string>;
    longTermGoal?: PrimitiveValidation<string>;
    partners?: BusinessPlanPartner[];
    suppliers?: BusinessPlanSupplier[];
    founders?: BusinessPlanFounder[];
    additionalInformationsAboutMarket?: PrimitiveValidation<string>;
    competitors?: BusinessPlanCompetitor[];
    clientsDescription?: PrimitiveValidation<string>;
    firstRevenueGrowthRate?: PrimitiveValidation<number>;
    secondRevenueGrowthRate?: PrimitiveValidation<number>;
    supplierCredit?: PrimitiveValidation<SupplierCredit>;
    customerCredit?: PrimitiveValidation<CustomerCredit>;
    generalCosts?: BusinessPlanGeneralCost[];
    initialTreasuryInMonths?: PrimitiveValidation<number>;
    bankLoan?: BusinessPlanBankLoan;
    fundings?: BusinessPlanFunding[];
    personalInvestments?: BusinessPlanPersonalInvestment[];
    inKindContributions?: BusinessPlanInKindContribution[];
    hasSalesSeasonalities?: boolean;
    salesSeasonalities?: BusinessPlanSalesSeasonality[];
    hasGeneralCostsSeasonalities?: boolean;
    generalCostsSeasonalities?: BusinessPlanGeneralCostsSeasonality[];
    constructor(businessPlan, options: any = {}) {
        const { setEmptyValue } = options;
        super(businessPlan);
        this.userId = businessPlan?.userId;
        this.isBeingGenerated = businessPlan?.isBeingGenerated;
        this.title = setField(
            businessPlan?.title,
            PrimitiveValidation,
            setEmptyValue
        );
        this.projectOwner = setField(
            businessPlan?.projectOwner,
            BusinessPlanProjectOwner,
            setEmptyValue
        );
        this.projectLocation = setField(
            businessPlan?.projectLocation,
            BusinessPlanProjectLocation,
            setEmptyValue
        );
        this.projectAreaInformations = setField(
            businessPlan?.projectAreaInformations,
            BusinessPlanProjectAreaInformations,
            setEmptyValue
        );
        this.shortDescription = setField(
            businessPlan?.shortDescription,
            PrimitiveValidation,
            setEmptyValue
        );
        this.longDescription = setField(
            businessPlan?.longDescription,
            PrimitiveValidation,
            setEmptyValue
        );
        this.industryName = setField(
            businessPlan?.industryName,
            PrimitiveValidation,
            setEmptyValue
        );
        this.industryType = setField(
            businessPlan?.industryType,
            PrimitiveValidation,
            setEmptyValue
        );
        this.industryMainActivity = setField(
            businessPlan?.industryMainActivity,
            PrimitiveValidation,
            setEmptyValue
        );
        this.investments = setField(
            businessPlan?.investments,
            BusinessPlanInvestment,
            setEmptyValue,
            true
        );
        this.offers = setField(
            businessPlan?.offers,
            BusinessPlanOffer,
            setEmptyValue,
            true
        );
        this.snapshotsHistory = setField(
            businessPlan?.snapshotsHistory,
            BusinessPlanSnapshotHistory,
            true,
            true
        );
        this.personalInvestments = setField(
            businessPlan?.personalInvestments,
            BusinessPlanPersonalInvestment,
            setEmptyValue,
            true
        );
        this.legalStatus = setField(
            businessPlan?.legalStatus,
            PrimitiveValidation,
            setEmptyValue
        );
        this.projectType = setField(
            businessPlan?.projectType,
            PrimitiveValidation,
            setEmptyValue
        );
        this.salesMethods = setField(
            businessPlan?.salesMethods,
            PrimitiveValidation,
            setEmptyValue,
            true
        );
        this.communicationMethods = setField(
            businessPlan?.communicationMethods,
            BusinessPlanCommunicationMethod,
            setEmptyValue,
            true
        );
        this.launchDate = setField(
            businessPlan?.launchDate,
            PrimitiveValidation,
            setEmptyValue
        );
        this.employeesFirstYear = setField(
            businessPlan?.employeesFirstYear,
            BusinessPlanEmployee,
            setEmptyValue,
            true
        );
        this.employeesNextYears = setField(
            businessPlan?.employeesNextYears,
            BusinessPlanEmployee,
            setEmptyValue,
            true
        );
        this.willRecruitFirstYear = setField(
            businessPlan?.willRecruitFirstYear,
            'boolean',
            setEmptyValue
        );
        this.willRecruitNextYears = setField(
            businessPlan?.willRecruitNextYears,
            'boolean',
            setEmptyValue
        );
        this.shortTermGoal = setField(
            businessPlan?.shortTermGoal,
            PrimitiveValidation,
            setEmptyValue
        );
        this.middleTermGoal = setField(
            businessPlan?.middleTermGoal,
            PrimitiveValidation,
            setEmptyValue
        );
        this.longTermGoal = setField(
            businessPlan?.longTermGoal,
            PrimitiveValidation,
            setEmptyValue
        );
        this.partners = setField(
            businessPlan?.partners,
            BusinessPlanPartner,
            setEmptyValue,
            true
        );
        this.suppliers = setField(
            businessPlan?.suppliers,
            BusinessPlanSupplier,
            setEmptyValue,
            true
        );
        this.founders = setField(
            businessPlan?.founders,
            BusinessPlanFounder,
            setEmptyValue,
            true
        );
        this.additionalInformationsAboutMarket = setField(
            businessPlan?.additionalInformationsAboutMarket,
            PrimitiveValidation,
            setEmptyValue
        );
        this.competitors = setField(
            businessPlan?.competitors,
            BusinessPlanCompetitor,
            setEmptyValue,
            true
        );
        this.clientsDescription = setField(
            businessPlan?.clientsDescription,
            PrimitiveValidation,
            setEmptyValue
        );
        this.firstRevenueGrowthRate = setField(
            businessPlan?.firstRevenueGrowthRate,
            PrimitiveValidation,
            setEmptyValue
        );
        this.secondRevenueGrowthRate = setField(
            businessPlan?.secondRevenueGrowthRate,
            PrimitiveValidation,
            setEmptyValue
        );
        this.supplierCredit = setField(
            businessPlan?.supplierCredit,
            PrimitiveValidation,
            setEmptyValue
        );
        this.customerCredit = setField(
            businessPlan?.customerCredit,
            PrimitiveValidation,
            setEmptyValue
        );
        this.generalCosts = setField(
            businessPlan?.generalCosts,
            BusinessPlanGeneralCost,
            setEmptyValue,
            true
        );
        this.initialTreasuryInMonths = setField(
            businessPlan?.initialTreasuryInMonths,
            PrimitiveValidation,
            setEmptyValue
        );
        this.bankLoan = setField(
            businessPlan?.bankLoan,
            BusinessPlanBankLoan,
            setEmptyValue
        );
        this.fundings = setField(
            businessPlan?.fundings,
            BusinessPlanFunding,
            setEmptyValue,
            true
        );
        this.inKindContributions = setField(
            businessPlan?.inKindContributions,
            BusinessPlanInKindContribution,
            setEmptyValue,
            true
        );
        this.hasSalesSeasonalities = setField(
            businessPlan?.hasSalesSeasonalities,
            'boolean',
            setEmptyValue
        );
        this.salesSeasonalities = setField(
            businessPlan?.salesSeasonalities,
            BusinessPlanSalesSeasonality,
            setEmptyValue,
            true
        );
        this.hasGeneralCostsSeasonalities = setField(
            businessPlan?.hasGeneralCostsSeasonalities,
            'boolean',
            setEmptyValue
        );
        this.generalCostsSeasonalities = setField(
            businessPlan?.generalCostsSeasonalities,
            BusinessPlanGeneralCostsSeasonality,
            setEmptyValue,
            true
        );
    }
    static getNecessaryProjectionFieldsForPdf() {
        return {
            _id: true,
            projectOwner: true,
            title: true,
            shortDescription: true,
            longDescription: true,
            industryName: true,
            industryType: true,
            IndustryMainActivity: true,
            offers: true,
            investments: true,
            legalStatus: true,
            projectType: true,
            location: true,
            salesMethods: true,
            communicationMethods: true,
            launchDate: true,
            employeesFirstYear: true,
            employeesNextYears: true,
            willRecruitFirstYear: true,
            willRecruitNextYears: true,
            shortTermGoal: true,
            middleTermGoal: true,
            longTermGoal: true,
            partners: true,
            suppliers: true,
            founders: true,
            additionalInformationsAboutMarket: true,
            competitors: true,
            clientsDescription: true,
            firstRevenueGrowthRate: true,
            secondRevenueGrowthRate: true,
            supplierCredit: true,
            customerCredit: true,
            generalCosts: true,
            initialTreasuryInMonths: true,
            bankLoan: true,
            fundings: true,
            personalInvestments: true,
            inKindContributions: true,
            hasSalesSeasonalities: true,
            salesSeasonalities: true,
            hasGeneralCostsSeasonalities: true,
            generalCostsSeasonalities: true,
        };
    }

    static async getPdf(
        bpId: ObjectId,
        { noMimeHeader, isLocalGeneration } = {
            noMimeHeader: false,
            isLocalGeneration: false,
        }
    ) {
        if (process.env.NODE_ENV === 'test' || isLocalGeneration) {
            const businessPlanDbItem: BusinessPlanModel = new BusinessPlanModel(
                await db.col(DbCollection.BUSINESS_PLAN).findOne(
                    { _id: new ObjectId(bpId) },
                    {
                        projection:
                            BusinessPlanModel.getNecessaryProjectionFieldsForPdf(),
                    }
                )
            );
            if (!businessPlanDbItem) {
                throw new Error(`bpNotFound: ${bpId}`);
            }
            return getBpAsBase64Pdf(businessPlanDbItem, { noMimeHeader });
        }
        const res = await axios.post(
            `${process.env.EVENT_URL}${Route.GET_BP_PDF}`,
            {
                bpId,
                noMimeHeader,
            }
        );
        return (<any>res.data).pdf || '';
    }
    async snapshotBusinessPlanPdf() {
        if (!this._id) {
            throw new Error('BusinessPlan: Bp needs an id to be snapshotted');
        }
        const passwordByteLength = 10;
        const generatedPassword =
            randomBytes(passwordByteLength).toString('hex');
        const now = new Date();
        const pdfFile = new FileModel({
            bpId: this._id,
            fileType: FileType.BUSINESS_PLAN_SNAPSHOT,
            fileName: `snapshot_${now.toISOString()}.pdf`,
            subFolder: `${now.toISOString()}`,
            local_base64content: await BusinessPlanModel.getPdf(this._id, {
                noMimeHeader: true,
                isLocalGeneration: false,
            }),
            password: generatedPassword,
        });
        await pdfFile.saveFileToS3();
        const { insertedId } = await db
            .col(DbCollection.FILE)
            .insertOne(pdfFile.dbInsert());
        await db.col(DbCollection.BUSINESS_PLAN).updateOne(
            {
                _id: this._id,
            },
            {
                $push: {
                    snapshotsHistory: new BusinessPlanSnapshotHistory({
                        id: insertedId,
                        createdAt: new Date(),
                    }),
                },
            }
        );
        this.snapshotsHistory.push(
            new BusinessPlanSnapshotHistory({
                id: insertedId,
                createdAt: new Date(),
            })
        );
        return { snapshotId: insertedId, password: generatedPassword };
    }
}

export {
    BusinessPlanModel,
    BusinessPlanInvestment,
    BusinessPlanOffer,
    BusinessPlanProjectOwner,
    BusinessPlanProjectAreaInformations,
    BusinessPlanProjectLocation,
    BusinessPlanCommunicationMethod,
    BusinessPlanEmployee,
    BusinessPlanPartner,
    BusinessPlanSupplier,
    BusinessPlanFounder,
    BusinessPlanCompetitor,
    BusinessPlanGeneralCost,
    BusinessPlanBankLoan,
    BusinessPlanFunding,
    BusinessPlanPersonalInvestment,
    BusinessPlanInKindContribution,
    BusinessPlanSalesSeasonality,
    BusinessPlanGeneralCostsSeasonality,
    PrimitiveValidation,
};

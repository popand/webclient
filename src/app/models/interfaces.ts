namespace models {
    export interface IPromotion {
        deleteDate: Date;
        id: string;
        name: string;
        tags: string[];
        tenantId: string;
    }

    export interface IGenre {
        id: any;
        name: string;
        tenantId: any;
        deleteDate: any;
    }

    export interface IImage {
        id: string;
        imageId: string;
        imageHeight: number;
        imageType: string; // enum?
        imageURL: string;
        imageWidth: number;
    }

    export interface IMedia {
        id: string;
        mediaId: string;
        componentId: string;
        screenFormat: string;
        aspectRatio: string;
        mediaFormat: string;
        targetDevice: string;
        url?: string;
    }

    export interface IDate {
        millis: number;
    }

    export abstract class IProduct {
        id: string;
        productId: string;
        name: string;
        studio: string;
        subtitleList: string[];
        genres: string[];
        canWatchNow: boolean;
        comingSoon: boolean;
        seoUrl: string;
        network: any;
        releaseYear: string;
        productType: string;
        blackoutIndicator: boolean; // False, capitalized?
        languages: string[];
        title: string;
        requiredAddonIds: any;
        criticId: any;
        averageUserRating: string;
        longDescription: string;
        actors: string[];
        blackoutWindowEnd: any;
        producers: string[];
        blackoutWindowStart: any;
        deliveryTypes: string[];
        bindId: string;
        videos: IMedia[];
        previewList: IMedia[];
        altCode: string;
        boxOfficeGross: string;
        runningTime: string; // date / time, moment?
        closedCaption: boolean;  // False
        country: string;
        requiredPackageId: string;
        imageList: IImage[];
        shortDescription: string;
        shortTitle: string;
        mediaList: IMedia[];
        purchaseOptionList: IPurchaseOption[];
        contentProvider: string;
        ratingReason: string;
        writers: string[];
        rating: string; // enum
        directors: string[];
        tenantId: string;
        version: string;
        createdDate: IDate;


        // helpers
        imageType = '';

        get image() {
            return this.getImage();
        }

        getImage(imageType?: string) {
            imageType = imageType || this.imageType || 'Medium';
            return _.find(this.imageList, {imageType});
        }
    }

    export class Product extends IProduct {
        images: {[index: string]: IImage} = {};

        static fromJson(data: IProduct) {
            var product = new Product();
            _.extend(product, data);

            _.map(product.imageList, x => {
                product.images[x.imageType.toLowerCase()] = x;
            });

            return product;
        }

    }

    export interface IPromotionDetails {
        products: IProduct[];
        promotion: IPromotion;
    }

    export interface IPurchaseOption {
        id: string;
        creationDate: string;  // timestamp, date?
        offerType: string; // enum
        startDateTimestampMillis: string; // timestamp, number, date?
        price: string; // float
        description: string;
        mediaList: IMedia[];
        endDateTimestampMillis: string; // timestamp
        entitlementDurationMillis: string; // number?
        purchaseOptionId: string;
        offerId: string;
    }

    export interface IReview {
        id: string;
        comment: string;
        createDate: string;
        customerId: string;
        deleteDate: string;
        productId: string;
        tenantId: string;
    }

    export interface ICustomer {
        password: string; // , optional),
        addressLine1?: string; // , optional),
        addressLine2?: string; // , optional),
        city?: string; // , optional),
        provinceState?: string; // , optional),
        country?: string; // , optional),
        zipPostal?: string; // , optional),
        homeNumber?: string; // , optional),
        workNumber?: string; // , optional),
        mobileNumber?: string; // , optional),
        firstName?: string; // , optional),
        lastName?: string; // , optional),
        email: string; // , optional)
    }
}

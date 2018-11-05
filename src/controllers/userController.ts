import { Request, Response } from 'express';
import validationMiddleware from '../middleware/validationMiddleware';
import validators from '../utils/validators';
import * as password from '../utils/password';
import { querystring } from '../utils/request';
import * as response from '../utils/response';
import User, { IUser } from '../models/user';

export const getUsers = async (req: Request, res: Response) => {
    const size = querystring.getInt(req, 'size', 10);
    const page = querystring.getInt(req, 'page', 1);
    const search = getSearchExpression(req.query.search);
    const sort = getSortExpression(req.query.sort);

    const totalCount = await User.find(search).countDocuments();

    const users = await User.find(search)
        .sort(sort)
        .limit(size)
        .skip(size * (page - 1))
        .exec();

    const totalPages = Math.ceil(totalCount / size);

    return response.generate(res, 200, undefined, {
        items: users.map(user => ({
            id: user.id,
            emailAddress: user.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            isLockedOut: user.isLockedOut,
            hasPassword: !!user.password,
            emailConfirmed: user.emailConfirmed,
            twoFactorEnabled: user.twoFactorEnabled,
            gravatarUrl: user.gravatarUrl
        })),
        page,
        size,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        search: req.query.search,
        sort: req.query.sort
    });
};

export const createUser = [
    validationMiddleware([
        validators.emailAddress,
        validators.password,
        validators.firstName,
        validators.lastName,
        validators.dateOfBirth
    ]),
    async (req: Request, res: Response) => {
        const existing = await User.findOne({
            emailAddress: req.body.emailAddress
        });

        if (existing) {
            return response.generate(res, 400, [
                `User name "${req.body.emailAddress}" is already taken.`
            ]);
        }

        const user = new User({
            emailAddress: req.body.emailAddress,
            password: await password.hash(req.body.password),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dateOfBirth: req.body.dateOfBirth,
            roles: req.body.roles
        });

        await user.save();

        return response.generate(res, 200, ['User successfully created.']);
    }
];

export const getUser = async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return response.generate(res, 404, ['User not found.']);
    }

    return response.generate(res, 200, undefined, {
        id: user.id,
        emailAddress: user.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        isLockedOut: user.isLockedOut,
        hasPassword: !!user.password,
        emailConfirmed: user.emailConfirmed,
        twoFactorEnabled: user.twoFactorEnabled,
        roles: user.roles,
        gravatarUrl: user.gravatarUrl
    });
};

export const updateUser = [
    validationMiddleware([
        validators.emailAddress,
        validators.firstName,
        validators.lastName,
        validators.dateOfBirth
    ]),
    async (req: Request, res: Response) => {
        const user = await User.findById(req.params.id);
        if (!user) {
            return response.generate(res, 404, ['User not found.']);
        }

        if (user.emailAddress !== req.body.emailAddress) {
            const existing = await User.findOne({
                emailAddress: req.body.emailAddress
            });

            if (existing) {
                return response.generate(res, 400, [
                    `User name "${req.body.emailAddress}" is already taken.`
                ]);
            }

            user.emailConfirmed = undefined;
            user.verifyEmailToken = undefined;
        }

        user.emailAddress = req.body.emailAddress;
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.dateOfBirth = req.body.dateOfBirth;
        user.roles = req.body.roles;
        await user.save();

        return response.generate(res, 200, ['User successfully updated.']);
    }
];

export const lockUser = async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return response.generate(res, 404, ['User not found.']);
    }

    if (user.id === res.locals.userId) {
        return response.generate(res, 400, [
            'Cannot lock currently logged in user.'
        ]);
    }

    user.isLockedOut = true;
    await user.save();

    return response.generate(res, 200, ['User successfully locked.']);
};

export const unlockUser = async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return response.generate(res, 404, ['User not found.']);
    }

    user.isLockedOut = undefined;
    await user.save();

    return response.generate(res, 200, ['User successfully unlocked.']);
};

export const deleteUser = async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return response.generate(res, 404, ['User not found.']);
    }

    if (user.id === res.locals.userId) {
        return response.generate(res, 400, [
            'Cannot delete currently logged in user.'
        ]);
    }

    await user.remove();

    return response.generate(res, 200, ['User successfully deleted.']);
};

const getSearchExpression = (search: string) => {
    if (!search) {
        return undefined;
    }

    // return { $text: { $search: search } };
    return { search: { $regex: search, $options: 'i' } };
};

const getSortExpression = (sort: string) => {
    const sortExpression = [];

    switch (sort) {
        case 'email_address':
            sortExpression.push(['emailAddress', 'ascending']);
            break;

        case 'email_address_desc':
            sortExpression.push(['emailAddress', 'descending']);
            break;

        case 'display_name_desc':
            sortExpression.push(['firstName', 'descending']);
            sortExpression.push(['lastName', 'descending']);
            break;

        default:
            sortExpression.push(['firstName', 'ascending']);
            sortExpression.push(['lastName', 'ascending']);
            break;
    }

    return sortExpression;
};

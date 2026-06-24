import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { HawkSoftService } from '../../services/hawksoft.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';

const getAgencies = catchAsync(async (req: Request, res: Response) => {
    const result = await HawkSoftService.getAgencies();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Agencies retrieved successfully',
        data: result,
    });
});

const getClientPolicies = catchAsync(async (req: Request, res: Response) => {
    const agencyId = req.params.agencyId || '17837';
    const { clientId } = req.params;

    if (!clientId) {
        throw new AppError('Client ID is required', httpStatus.BAD_REQUEST);
    }

    const result = await HawkSoftService.getPolicies(Number(agencyId), Number(clientId));
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Client policies retrieved successfully',
        data: result,
    });
});

const getPolicyByNumber = catchAsync(async (req: Request, res: Response) => {
    const agencyId = req.params.agencyId || '17837';
    const { policyNumber } = req.params;

    if (!policyNumber) {
        throw new AppError('Policy Number is required', httpStatus.BAD_REQUEST);
    }

    const result = await HawkSoftService.getPolicyByNumber(Number(agencyId), policyNumber);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Policy information retrieved successfully',
        data: result,
    });
});

const getClient = catchAsync(async (req: Request, res: Response) => {
    const agencyId = req.params.agencyId || '17837';
    const { clientId } = req.params;

    if (!clientId) {
        throw new AppError('Client ID is required', httpStatus.BAD_REQUEST);
    }

    const result = await HawkSoftService.getClient(Number(agencyId), Number(clientId));
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Client details retrieved successfully',
        data: result,
    });
});

const searchClients = catchAsync(async (req: Request, res: Response) => {
    const agencyId = req.params.agencyId || '17837';
    const { phone, name, limit } = req.query;

    if (!agencyId) {
        throw new AppError('Agency ID is required', httpStatus.BAD_REQUEST);
    }

    const result = await HawkSoftService.searchClients(
        Number(agencyId),
        { phone: phone as string, name: name as string },
        limit ? Number(limit) : 20
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Clients searched successfully',
        data: result,
    });
});

export const HawkSoftController = {
    getAgencies,
    getClientPolicies,
    getPolicyByNumber,
    getClient,
    searchClients,
};

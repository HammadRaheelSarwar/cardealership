import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/search.service';

export class SearchController {
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const dealershipId = req.tenant!.dealershipId;
      const query = (req.query.q as string) || '';

      const results = await searchService.searchAll(dealershipId, query);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }
}

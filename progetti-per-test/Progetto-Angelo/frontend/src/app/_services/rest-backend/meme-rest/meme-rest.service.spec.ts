import { TestBed } from '@angular/core/testing';

import { MemeRestService } from './meme-rest.service';

describe('MemeRestService', () => {
  let service: MemeRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemeRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

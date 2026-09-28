/*
 *
 *  * Copyright 2016-2017 the original author or authors.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *      http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

/**
 * @author Vitaliy Fedoriv
 */

import { TestBed } from '@angular/core/testing';
import {VetService} from './vet.service';
import {provideHttpClient} from '@angular/common/http';
import {HttpErrorHandler} from '../error.service';
import {provideHttpClientTesting} from '@angular/common/http/testing';

describe('VetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VetService, HttpErrorHandler, provideHttpClient(), provideHttpClientTesting()]
    });
  });

  it('should ...', () => {
    const vetService = TestBed.inject(VetService);
    expect(vetService).toBeTruthy();
  });
});

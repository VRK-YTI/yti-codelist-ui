//
// original: https://github.com/robianmcd/angular-lazy-for
// fork: https://github.com/skunkbadger/angular-lazy-for
//
// copied directly into project for angular12 compatibility
//

import {
    Input, Directive, ViewContainerRef, TemplateRef, DoCheck, IterableDiffers, IterableDiffer
} from '@angular/core';

@Directive({
    selector: '[lazyFor]'
})
export class LazyForDirective implements DoCheck {
    @Input('lazyForWithHeight') itemHeight: number;
    @Input('lazyForInContainer') containerElem: HTMLElement | null;
    @Input('lazyForWithTagName') itemTagName: string;

    @Input()
    set lazyForOf(list: any) {
        this.list = list;

        if (list) {
            this.differ = this.iterableDiffers.find(list).create();

            if (this.initialized) {
                this.update();
            }
        }
    }

    private templateElem: HTMLElement | null;

    private beforeListElem: HTMLElement;
    private afterListElem: HTMLElement;

    private list = [];

    private initialized = false;
    private firstUpdate = true;

    private differ: IterableDiffer<any>;

    private lastChangeTriggeredByScroll = false;

    constructor(
        private vcr: ViewContainerRef,
        private tpl: TemplateRef<any>,
        private iterableDiffers: IterableDiffers
    ) {

    }

    ngOnInit() {
        this.templateElem = this.vcr.element.nativeElement;

        if (this.containerElem === undefined && this.templateElem !== null) {
            this.containerElem = this.templateElem.parentNode as HTMLElement;
        }

        //Adding an event listener will trigger ngDoCheck whenever the event fires so we don't actually need to call
        //update here.
        if (this.containerElem !== null) {
          this.containerElem.addEventListener('scroll', (e) => {
              this.lastChangeTriggeredByScroll = true;
          });
        }

        this.initialized = true;
    }

    ngDoCheck() {
        if(this.differ && Array.isArray(this.list)) {
            if(this.lastChangeTriggeredByScroll) {
                this.update();
                this.lastChangeTriggeredByScroll = false;
            } else {
                let changes = this.differ.diff(this.list);

                if(changes !== null) {
                    this.update();
                }

            }
        }

    }

    //Preconditions:
    //  this.list is an array
    private update() {
        //Can't run the first update unless there is an element in the list
        if (this.list.length === 0) {
            this.vcr.clear();
            if(!this.firstUpdate) {
                this.beforeListElem.style.height = "0";
                this.afterListElem.style.height = "0";
            }
            return;
        }

        if (this.firstUpdate) {
            this.onFirstUpdate();
        }

        let listHeight = this.containerElem?.clientHeight;
        let scrollTop = this.containerElem?.scrollTop;

        //The height of anything inside the container but above the lazyFor content;
        let fixedHeaderHeight = this.containerElem === null ?
          null:
          (this.beforeListElem.getBoundingClientRect().top - this.beforeListElem.scrollTop) -
          (this.containerElem.getBoundingClientRect().top - this.containerElem.scrollTop);

        //This needs to run after the scrollTop is retrieved.
        this.vcr.clear();

        let listStartI = Math.floor(((scrollTop ?? 0) - (fixedHeaderHeight ?? 0)) / this.itemHeight);
        listStartI = this.limitToRange(listStartI, 0, this.list.length);

        let listEndI = Math.ceil(((scrollTop ?? 0) - (fixedHeaderHeight ?? 0) + (listHeight ?? 0)) / this.itemHeight);
        listEndI = this.limitToRange(listEndI, -1, this.list.length - 1);

        for (let i = listStartI; i <= listEndI; i++) {
            this.vcr.createEmbeddedView(this.tpl, {
                $implicit: this.list[i],
                index: i
            });
        }

        this.beforeListElem.style.height = `${listStartI * this.itemHeight}px`;
        this.afterListElem.style.height = `${(this.list.length - listEndI - 1) * this.itemHeight}px`;
    }

    private onFirstUpdate() {
        let sampleItemElem: HTMLElement | null = null;
        if (this.itemHeight === undefined || this.itemTagName === undefined) {
            this.vcr.createEmbeddedView(this.tpl, {
                $implicit: this.list[0],
                index: 0
            });
            sampleItemElem = <HTMLElement>this.templateElem?.nextSibling;
        }

        if (this.itemHeight === undefined && sampleItemElem !== null) {
            this.itemHeight = sampleItemElem.clientHeight;
        }

        if (this.itemTagName === undefined && sampleItemElem !== null) {
            this.itemTagName = sampleItemElem.tagName;
        }

        this.beforeListElem = document.createElement(this.itemTagName);
        if (this.templateElem && this.templateElem.parentNode) {
          this.templateElem.parentNode.insertBefore(this.beforeListElem, this.templateElem);
        }

        this.afterListElem = document.createElement(this.itemTagName);
        //This inserts after the templateElem. see http://stackoverflow.com/a/4793630/373655 for details
        if (this.templateElem && this.templateElem.parentNode) {
          this.templateElem.parentNode.insertBefore(this.afterListElem, this.templateElem.nextSibling);
        }

        if (this.itemTagName.toLowerCase() === 'li') {
            this.beforeListElem.style.listStyleType = 'none';
            this.afterListElem.style.listStyleType = 'none';
        }

        this.firstUpdate = false;
    }

    private limitToRange(num: number, min: number, max: number) {
        return Math.max(
            Math.min(num, max),
            min
        );
    }

}
